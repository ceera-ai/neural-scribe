import { useState } from 'react'
import { WelcomeStep } from './steps/WelcomeStep'
import { EngineSelectionStep } from './steps/EngineSelectionStep'
import { ApiKeyStep } from './steps/ApiKeyStep'
import { ClaudeCliStep } from './steps/ClaudeCliStep'
import { PermissionsStep } from './steps/PermissionsStep'
import { SuccessStep } from './steps/SuccessStep'
import './OnboardingWizard.css'

interface OnboardingWizardProps {
  onComplete: () => void
}

export interface OnboardingState {
  currentStep: number
  selectedEngine: 'elevenlabs' | 'deepgram' | null
  apiKeyValidated: boolean
  deepgramModel: 'nova-3' | 'nova-3-monolingual' | 'nova-3-multilingual' | 'nova-2' | 'flux'
  claudeCliAvailable: boolean
  claudeCliVersion: string | null
  accessibilityGranted: boolean
  microphoneGranted: boolean
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    selectedEngine: null,
    apiKeyValidated: false,
    deepgramModel: 'nova-3',
    claudeCliAvailable: false,
    claudeCliVersion: null,
    accessibilityGranted: false,
    microphoneGranted: false,
  })

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }))
  }

  const prevStep = () => {
    setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }))
  }

  const handleEngineSelected = (engine: 'elevenlabs' | 'deepgram') => {
    updateState({ selectedEngine: engine })
    nextStep()
  }

  const handleApiKeyValidated = () => {
    updateState({ apiKeyValidated: true })
    nextStep()
  }

  const handleClaudeCliComplete = (available: boolean, version: string | null) => {
    updateState({ claudeCliAvailable: available, claudeCliVersion: version })
    nextStep()
  }

  const handlePermissionsComplete = () => {
    nextStep()
  }

  const handleComplete = async () => {
    // Mark first launch as completed
    if (window.electronAPI) {
      const settings = await window.electronAPI.getSettings()
      await window.electronAPI.setSettings({ ...settings, hasCompletedFirstLaunch: true })
    }
    onComplete()
  }

  const steps = [
    {
      component: <WelcomeStep onContinue={nextStep} />,
      title: 'Welcome',
    },
    {
      component: <EngineSelectionStep onEngineSelected={handleEngineSelected} onBack={prevStep} />,
      title: 'Select Engine',
    },
    {
      component: (
        <ApiKeyStep
          engine={state.selectedEngine!}
          deepgramModel={state.deepgramModel}
          onDeepgramModelChange={(model) => updateState({ deepgramModel: model })}
          onValidated={handleApiKeyValidated}
          onBack={prevStep}
        />
      ),
      title: 'API Key',
    },
    {
      component: (
        <ClaudeCliStep
          onComplete={handleClaudeCliComplete}
          onSkip={() => handleClaudeCliComplete(false, null)}
          onBack={prevStep}
        />
      ),
      title: 'Claude CLI',
    },
    {
      component: (
        <PermissionsStep
          onComplete={handlePermissionsComplete}
          onAccessibilityGranted={(granted) => updateState({ accessibilityGranted: granted })}
          onBack={prevStep}
        />
      ),
      title: 'Permissions',
    },
    {
      component: (
        <SuccessStep
          engine={state.selectedEngine!}
          claudeCliAvailable={state.claudeCliAvailable}
          claudeCliVersion={state.claudeCliVersion}
          onComplete={handleComplete}
        />
      ),
      title: 'Ready',
    },
  ]

  const currentStepData = steps[state.currentStep]
  const progress = ((state.currentStep + 1) / steps.length) * 100

  return (
    <div className="onboarding-wizard">
      {/* Background effects */}
      <div className="onboarding-bg">
        <div className="scanlines" />
        <div className="cyber-grid" />
      </div>

      {/* Progress bar */}
      <div className="onboarding-progress-container">
        <div className="onboarding-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div className="onboarding-step-indicators">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-indicator ${
              index === state.currentStep
                ? 'active'
                : index < state.currentStep
                  ? 'completed'
                  : 'upcoming'
            }`}
            title={step.title}
          >
            {index < state.currentStep ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <div className="onboarding-content">{currentStepData.component}</div>
    </div>
  )
}
