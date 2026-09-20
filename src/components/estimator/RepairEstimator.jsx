// src/components/estimator/RepairEstimator.jsx
// 3-step interactive repair estimator with WhatsApp deep-link CTA
import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, MessageCircle, RotateCcw, Smartphone, Wrench } from 'lucide-react';
import { BRANDS, MODELS, ISSUES, getPriceEstimate, buildWhatsAppText } from '../../data/repairPrices';
import { usePricingMatrix } from '../../hooks/usePricingMatrix';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const STEPS = ['Choose Brand', 'Select Model', 'Pick Issue'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i < current
                ? 'var(--gradient-brand)'
                : i === current
                  ? 'var(--gradient-brand)'
                  : 'var(--color-bg-card)',
              border: i > current ? '2px solid var(--color-border)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
              color: i <= current ? '#fff' : 'var(--color-text-muted)',
              boxShadow: i === current ? 'var(--shadow-glow-brand)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              {i < current ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 500,
              color: i <= current ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: 60, height: 2, margin: '0 8px', marginBottom: 22,
              background: i < current ? 'var(--gradient-brand)' : 'var(--color-border)',
              transition: 'background 0.3s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RepairEstimator() {
  const [step,         setStep]         = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const { settings } = useStoreSettings();
  const waNumber = (settings.contactWhatsApp || '').replace(/\D/g, '');
  const { matrix: priceMatrix } = usePricingMatrix();

  const priceEstimate = selectedBrand && selectedIssue
    ? getPriceEstimate(selectedBrand.id, selectedIssue.id, priceMatrix)
    : null;

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedIssue(null);
    setStep(1);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setSelectedIssue(null);
    setStep(2);
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setStep(3);
  };

  const handleReset = () => {
    setStep(0);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedIssue(null);
  };

  const handleWhatsApp = () => {
    if (!selectedBrand || !selectedModel || !selectedIssue || !priceEstimate) return;
    const text = buildWhatsAppText({
      brand:      selectedBrand.label,
      model:      selectedModel,
      issue:      selectedIssue.label,
      priceRange: priceEstimate.display,
      turnaround: selectedIssue.turnaround,
      shopName:   settings.shopName,
    });
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Step indicator — only for steps 0-2 */}
      {step < 3 && <StepIndicator current={step} />}

      {/* STEP 0 — Brand */}
      {step === 0 && (
        <div className="step-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 10, borderRadius: 12, background: 'rgba(108,99,255,0.15)' }}>
              <Smartphone size={22} style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>Choose Your Brand</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Select the phone manufacturer</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                className="option-pill"
                onClick={() => handleBrandSelect(brand)}
                style={{ justifyContent: 'flex-start' }}
              >
                <span style={{ fontSize: '1.2rem' }}>{brand.emoji}</span>
                <span>{brand.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1 — Model */}
      {step === 1 && selectedBrand && (
        <div className="step-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ padding: 10, borderRadius: 12, background: 'rgba(108,99,255,0.15)' }}>
              <span style={{ fontSize: '1.3rem' }}>{selectedBrand.emoji}</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>Select Your {selectedBrand.label} Model</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Choose the specific device</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {(MODELS[selectedBrand.id] || MODELS.other).map((model) => (
              <button
                key={model}
                className="option-pill"
                onClick={() => handleModelSelect(model)}
              >
                <ChevronRight size={14} />
                {model}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Issue */}
      {step === 2 && selectedBrand && selectedModel && (
        <div className="step-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ padding: 10, borderRadius: 12, background: 'rgba(108,99,255,0.15)' }}>
              <Wrench size={22} style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>What's the Issue?</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{selectedBrand.label} {selectedModel}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {ISSUES.map((issue) => (
              <button
                key={issue.id}
                className="option-pill"
                onClick={() => handleIssueSelect(issue)}
                style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 16px', gap: 6 }}
              >
                <span style={{ fontSize: '1.4rem' }}>{issue.emoji}</span>
                <span style={{ fontWeight: 500 }}>{issue.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>⏱ {issue.turnaround}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Result */}
      {step === 3 && selectedBrand && selectedModel && selectedIssue && priceEstimate && (
        <div className="step-card" style={{ textAlign: 'center', background: 'var(--gradient-card)', borderColor: 'rgba(108,99,255,0.3)' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-glow-brand)',
            }}>
              <CheckCircle size={30} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Your Repair Estimate</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {selectedBrand.emoji} {selectedBrand.label} {selectedModel}
            </p>
          </div>

          {/* Estimate card */}
          <div style={{
            background: 'var(--color-bg-card)', borderRadius: 16,
            padding: '24px', marginBottom: 24,
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Issue</p>
                <p style={{ fontWeight: 600 }}>{selectedIssue.emoji} {selectedIssue.label}</p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Turnaround</p>
                <p style={{ fontWeight: 600 }}>⏱ {selectedIssue.turnaround}</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Estimated Cost</p>
              <p className="gradient-text font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>
                {priceEstimate.display}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                *Final price confirmed after diagnosis
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-whatsapp btn-lg" onClick={handleWhatsApp} style={{ width: '100%' }}>
              <MessageCircle size={20} />
              Book via WhatsApp
            </button>
            <button className="btn btn-ghost" onClick={handleReset} style={{ width: '100%' }}>
              <RotateCcw size={16} />
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
