"use client";

import { useState, useEffect } from "react";
import { ModePaiement } from "@/data/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  amount: number;
  modePaiement: ModePaiement;
  clientNom: string;
  clientNumero: string;
}

type MobileMoneyProvider = "ORANGE_MONEY" | "MPESA" | "AIRTEL_MONEY" | "AFRIMONEY" | "VODACOM";

interface PaymentFormData {
  // Carte
  numeroCarte?: string;
  nomTitulaire?: string;
  dateExpiration?: string;
  cvv?: string;

  // Mobile Money
  provider?: MobileMoneyProvider;
  numeroMobile?: string;
  codePin?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  modePaiement,
  clientNom,
  clientNumero,
}: PaymentModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "success" | "push">("form");
  const [formData, setFormData] = useState<PaymentFormData>({
    numeroCarte: "",
    nomTitulaire: clientNom,
    dateExpiration: "",
    cvv: "",
    provider: "ORANGE_MONEY",
    numeroMobile: clientNumero || "",
    codePin: "",
  });
  const [countdown, setCountdown] = useState(30);
  const [pushAccepted, setPushAccepted] = useState(false);

  const mobileMoneyProviders = [
    { id: "ORANGE_MONEY", name: "Orange Money", icon: "🟠", color: "orange" },
    { id: "MPESA", name: "M-Pesa", icon: "🟢", color: "green" },
    { id: "AIRTEL_MONEY", name: "Airtel Money", icon: "🔴", color: "red" },
    { id: "AFRIMONEY", name: "Afrimoney", icon: "🟡", color: "yellow" },
    { id: "VODACOM", name: "Vodacom M-Pesa", icon: "🔵", color: "blue" },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setCountdown(30);
      setPushAccepted(false);
      setFormData({
        numeroCarte: "",
        nomTitulaire: clientNom,
        dateExpiration: "",
        cvv: "",
        provider: "ORANGE_MONEY",
        numeroMobile: clientNumero || "",
        codePin: "",
      });
    }
  }, [isOpen, clientNom, clientNumero]);

  useEffect(() => {
    if (step === "push" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "push" && countdown === 0 && !pushAccepted) {
      setStep("processing");
      setTimeout(() => {
        onSuccess({ modePaiement, amount, transactionId: `TXN-${Date.now()}` });
        setStep("success");
      }, 2000);
    }
  }, [step, countdown, pushAccepted, modePaiement, amount, onSuccess]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (modePaiement === "MOBILE_MONEY") {
      if (!formData.numeroMobile || !formData.provider) {
        alert("❌ Veuillez remplir tous les champs obligatoires");
        return;
      }
      // Pour mobile money, on simule l'envoi du push
      setStep("push");
    } else {
      if (!formData.numeroCarte || !formData.nomTitulaire || !formData.dateExpiration || !formData.cvv) {
        alert("❌ Veuillez remplir tous les champs obligatoires");
        return;
      }
      // Validation carte (simplifiée)
      const cardNumber = formData.numeroCarte.replace(/\s/g, "");
      if (cardNumber.length < 16) {
        alert("❌ Numéro de carte invalide (16 chiffres requis)");
        return;
      }
      if (formData.cvv.length < 3) {
        alert("❌ Code CVV invalide (3 chiffres requis)");
        return;
      }
      // Pour carte, on simule le traitement
      setStep("processing");
      setTimeout(() => {
        onSuccess({
          modePaiement,
          amount,
          transactionId: `TXN-${Date.now()}`,
          carte: cardNumber.slice(-4),
        });
        setStep("success");
      }, 3000);
    }
  };

  const handlePushAccept = () => {
    setPushAccepted(true);
    setStep("processing");
    setTimeout(() => {
      onSuccess({
        modePaiement,
        amount,
        transactionId: `TXN-${Date.now()}`,
        provider: formData.provider,
      });
      setStep("success");
    }, 2000);
  };

  const handlePushReject = () => {
    setStep("form");
    setCountdown(30);
    setPushAccepted(false);
    alert("❌ Transaction annulée. Veuillez réessayer.");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Paiement sécurisé</h2>
            <p className="text-sm text-white/80">
              {modePaiement === "MOBILE_MONEY" ? "Mobile Money" : "Carte bancaire"}
            </p>
          </div>
          {step === "form" && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Montant */}
              <div className="bg-gradient-to-r from-[#0033A0]/10 to-[#FFD200]/10 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Montant à payer</span>
                  <span className="text-2xl font-bold text-[#0033A0]">
                    {amount.toLocaleString("fr-FR")} FC
                  </span>
                </div>
              </div>

              {modePaiement === "MOBILE_MONEY" ? (
                <>
                  {/* Sélection du provider */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Choisissez votre opérateur Mobile Money
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {mobileMoneyProviders.map((provider) => {
                        const isSelected = formData.provider === provider.id;
                        const colorClasses = {
                          orange: isSelected ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300",
                          green: isSelected ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300",
                          red: isSelected ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300",
                          yellow: isSelected ? "border-yellow-500 bg-yellow-50" : "border-slate-200 hover:border-slate-300",
                          blue: isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300",
                        };

                        return (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, provider: provider.id as MobileMoneyProvider })}
                            className={`p-3 rounded-lg border-2 transition-all ${colorClasses[provider.color as keyof typeof colorClasses] || colorClasses.blue}`}
                          >
                            <div className="text-2xl mb-1">{provider.icon}</div>
                            <div className="text-xs font-medium text-slate-700">{provider.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Numéro mobile */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Numéro Mobile Money
                    </label>
                    <input
                      type="tel"
                      value={formData.numeroMobile}
                      onChange={(e) => setFormData({ ...formData, numeroMobile: e.target.value })}
                      placeholder="+243900000000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                      required
                    />
                  </div>

                  {/* Code PIN */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code PIN
                    </label>
                    <input
                      type="password"
                      value={formData.codePin}
                      onChange={(e) => setFormData({ ...formData, codePin: e.target.value })}
                      placeholder="••••"
                      maxLength={4}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Le code PIN vous sera demandé dans l'application {mobileMoneyProviders.find(p => p.id === formData.provider)?.name}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Numéro de carte */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={formData.numeroCarte}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 16);
                        const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                        setFormData({ ...formData, numeroCarte: formatted });
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 font-mono"
                      required
                    />
                  </div>

                  {/* Nom du titulaire */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      value={formData.nomTitulaire}
                      onChange={(e) => setFormData({ ...formData, nomTitulaire: e.target.value })}
                      placeholder="JEAN DUPONT"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 uppercase"
                      required
                    />
                  </div>

                  {/* Date d'expiration et CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        value={formData.dateExpiration}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          const formatted = value.match(/.{1,2}/g)?.join("/") || value;
                          setFormData({ ...formData, dateExpiration: formatted });
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 font-mono"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all shadow-lg hover:scale-105 active:scale-95 font-semibold mt-6"
              >
                {modePaiement === "MOBILE_MONEY" ? "Envoyer la demande de paiement" : "Payer maintenant"}
              </button>
            </form>
          )}

          {step === "push" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0033A0] to-[#FFD200] rounded-full flex items-center justify-center animate-pulse">
                <span className="text-4xl">📱</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Demande de paiement envoyée
                </h3>
                <p className="text-slate-600 mb-4">
                  Une notification a été envoyée sur votre téléphone via{" "}
                  <span className="font-semibold text-[#0033A0]">
                    {mobileMoneyProviders.find(p => p.id === formData.provider)?.name}
                  </span>
                </p>
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-slate-600 mb-1">Montant</div>
                  <div className="text-2xl font-bold text-[#0033A0]">
                    {amount.toLocaleString("fr-FR")} FC
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Numéro: {formData.numeroMobile}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Veuillez accepter la transaction dans l'application Mobile Money
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handlePushReject}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePushAccept}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:scale-105 active:scale-95"
                  >
                    J'ai accepté
                  </button>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-slate-500">
                    Expiration dans {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-[#0033A0] h-2 rounded-full transition-all"
                      style={{ width: `${(countdown / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center space-y-6 py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0033A0] border-t-transparent mx-auto"></div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Traitement en cours...
                </h3>
                <p className="text-slate-600">
                  {modePaiement === "MOBILE_MONEY"
                    ? "Vérification de la transaction Mobile Money"
                    : "Vérification de la carte bancaire"}
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  Paiement effectué avec succès !
                </h3>
                <p className="text-slate-600 mb-4">
                  Votre transaction a été validée
                </p>
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-slate-600 mb-1">Montant payé</div>
                  <div className="text-2xl font-bold text-[#0033A0]">
                    {amount.toLocaleString("fr-FR")} FC
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep("form");
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all shadow-lg hover:scale-105 active:scale-95 font-semibold"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

