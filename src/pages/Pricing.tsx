import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Crown, Sparkles, Shield, Zap, ChevronRight, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionPlans } from '../data';
import { SubscriptionTier, PageType } from '../types';

interface PricingProps {
  setPage: (page: PageType) => void;
}

export function Pricing({ setPage }: PricingProps) {
  const { user, subscription, updateSubscription, signInWithGoogle } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  // Monitor returned payment token from PayDunya / Simulation
  useEffect(() => {
    const handleHashCheck = () => {
      const currentHash = window.location.hash;
      if (currentHash.includes('?')) {
        const queryStr = currentHash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const token = params.get('token');
        const planId = params.get('planId') as SubscriptionTier;
        const userId = params.get('userId');
        const isAnn = params.get('isAnnual') === 'true';

        if (token && planId && userId && user && user.uid === userId) {
          verifyPaymentToken(token, planId, userId, isAnn);
        }
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [user]);

  const verifyPaymentToken = async (token: string, planId: SubscriptionTier, userId: string, isAnn: boolean) => {
    setLoadingPlan(planId);
    try {
      const response = await fetch(`/api/payments/verify-token?token=${token}&planId=${planId}&userId=${userId}&isAnnual=${isAnn}`);
      const data = await response.json();
      if (data.success) {
        await updateSubscription(planId);
        setSuccessPlan(planId);
        // Clear query parameters to restore clean hash
        window.location.hash = 'abonnement';
        setTimeout(() => setSuccessPlan(null), 3000);
      } else {
        alert("La vérification du paiement a échoué. Veuillez réessayer ou contacter le support.");
      }
    } catch (e) {
      console.error("Verification query error:", e);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSubscribe = async (planId: SubscriptionTier) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (planId === subscription) return;

    // Plan gratuit: simple update directly
    if (planId === 'free') {
      setLoadingPlan(planId);
      try {
        await updateSubscription('free');
        setSuccessPlan(planId);
        setTimeout(() => setSuccessPlan(null), 3000);
      } catch (e) {
        console.error('Subscription downgrading error:', e);
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    // Paid plans: request payment URL from backend
    setLoadingPlan(planId);
    const plan = subscriptionPlans.find(p => p.id === planId);
    const price = isAnnual ? plan!.priceAnnual : plan!.price;

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.uid,
          price,
          isAnnual,
          email: user.email || '',
          name: user.displayName || 'Utilisateur Iqra'
        }),
      });

      const data = await res.json();
      if (data.success && data.url) {
        // Redirect to PayDunya checkout / mock simulation checkout page
        window.location.href = data.url;
      } else {
        alert(data.error || "Une erreur s'est produite lors de l'initialisation du paiement.");
        setLoadingPlan(null);
      }
    } catch (e) {
      console.error('Subscription error:', e);
      alert("Impossible de joindre le serveur de paiement. Veuillez réessayer.");
      setLoadingPlan(null);
    }
  };


  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Shield;
      case 'basic': return Zap;
      case 'standard': return Star;
      case 'premium': return Crown;
      default: return Shield;
    }
  };

  const getButtonLabel = (planId: SubscriptionTier) => {
    if (planId === subscription) return 'Plan actuel';
    if (planId === 'free') return 'Plan gratuit';
    if (!user) return 'Se connecter pour souscrire';
    const currentLevel = ['free', 'basic', 'standard', 'premium'].indexOf(subscription);
    const targetLevel = ['free', 'basic', 'standard', 'premium'].indexOf(planId);
    return targetLevel > currentLevel ? 'Passer à ce plan' : 'Rétrograder';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto py-8 md:py-16"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setPage('home')}
        className="flex items-center gap-2 text-daara-text-muted hover:text-daara-gold transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Retour à l'accueil</span>
      </motion.button>

      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] aspect-square bg-daara-gold/5 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-daara-gold/30 bg-daara-surface/50 backdrop-blur-sm text-daara-gold font-medium text-sm tracking-wider uppercase relative z-10"
        >
          <Sparkles className="w-4 h-4" />
          Nos Offres
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-serif font-bold text-daara-text mb-6 leading-tight relative z-10"
        >
          Choisissez votre <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-daara-gold to-daara-gold-light">
            parcours d'apprentissage
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-daara-text-muted max-w-2xl mx-auto relative z-10 mb-10"
        >
          Investissez dans votre savoir islamique. Chaque plan vous rapproche d'une compréhension plus profonde de votre foi.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-4 bg-daara-surface border border-daara-gold/15 rounded-full p-1.5 relative z-10"
        >
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              !isAnnual
                ? 'bg-daara-gold text-daara-bg shadow-lg shadow-daara-gold/20'
                : 'text-daara-text-muted hover:text-daara-text'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              isAnnual
                ? 'bg-daara-gold text-daara-bg shadow-lg shadow-daara-gold/20'
                : 'text-daara-text-muted hover:text-daara-text'
            }`}
          >
            Annuel
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isAnnual ? 'bg-daara-bg/20 text-daara-bg' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              -20%
            </span>
          </button>
        </motion.div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
        {subscriptionPlans.map((plan, idx) => {
          const Icon = getPlanIcon(plan.id);
          const isCurrentPlan = subscription === plan.id;
          const price = isAnnual ? plan.priceAnnual : plan.price;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * idx }}
              className={`relative flex flex-col rounded-3xl border p-6 md:p-8 transition-all duration-500 ${
                plan.recommended
                  ? 'bg-gradient-to-b from-daara-gold/10 to-daara-surface border-daara-gold/40 shadow-2xl shadow-daara-gold/10 scale-[1.02] xl:-translate-y-3'
                  : 'bg-daara-surface border-daara-gold/10 hover:border-daara-gold/30 shadow-xl'
              } ${isCurrentPlan ? 'ring-2 ring-daara-gold/50' : ''}`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg text-xs font-bold rounded-full shadow-lg shadow-daara-gold/30 uppercase tracking-widest whitespace-nowrap">
                  ⭐ Recommandé
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4 px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider">
                  ✓ Actuel
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.badgeColor} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-daara-text mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-daara-text">
                    {price === 0 ? 'Gratuit' : price.toLocaleString('fr-FR')}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-daara-text-muted font-medium">
                      FCFA/{isAnnual ? 'mois' : 'mois'}
                    </span>
                  )}
                </div>
                {isAnnual && price > 0 && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    Soit {(price * 12).toLocaleString('fr-FR')} FCFA/an (économisez {((plan.price - plan.priceAnnual) * 12).toLocaleString('fr-FR')} FCFA)
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-daara-gold/20 to-transparent mb-6" />

              {/* Features List */}
              <div className="flex-grow space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-sm text-daara-text leading-relaxed">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <div key={`lim-${i}`} className="flex items-start gap-3 opacity-50">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-sm text-daara-text-muted leading-relaxed line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <AnimatePresence mode="wait">
                {successPlan === plan.id ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-center font-bold text-sm"
                  >
                    ✓ Abonnement activé !
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || loadingPlan === plan.id}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-daara-surface border-2 border-daara-gold/30 text-daara-gold cursor-default'
                        : plan.recommended
                          ? 'bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg hover:shadow-lg hover:shadow-daara-gold/20 hover:scale-[1.02] cursor-pointer'
                          : 'bg-daara-bg border border-daara-gold/20 text-daara-text hover:border-daara-gold/50 hover:bg-daara-surface-hover cursor-pointer'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {getButtonLabel(plan.id)}
                        {!isCurrentPlan && plan.id !== 'free' && <ChevronRight className="w-4 h-4" />}
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center bg-daara-surface rounded-3xl p-8 md:p-12 border border-daara-gold/10 shadow-xl"
      >
        <h3 className="text-2xl font-serif font-bold text-daara-text mb-4">
          Questions fréquentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mt-8">
          {[
            {
              q: 'Puis-je changer de plan à tout moment ?',
              a: 'Oui ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement prend effet immédiatement.'
            },
            {
              q: 'Comment fonctionne le paiement ?',
              a: 'Le paiement se fait via Orange Money, Wave, ou Mobile Money. Votre abonnement est renouvelé automatiquement chaque mois.'
            },
            {
              q: 'Y a-t-il un engagement minimum ?',
              a: 'Non, aucun engagement. Vous pouvez annuler à tout moment et revenir au plan gratuit.'
            },
            {
              q: 'Le contenu est-il mis à jour régulièrement ?',
              a: 'Oui, nous ajoutons de nouvelles leçons et modules chaque semaine. Les abonnés Premium y ont accès en avant-première.'
            },
          ].map((faq, i) => (
            <div key={i} className="bg-daara-bg/50 rounded-2xl p-5 border border-daara-gold/5">
              <h4 className="font-bold text-daara-text text-sm mb-2">{faq.q}</h4>
              <p className="text-daara-text-muted text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
