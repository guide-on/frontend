import LabeledStepper from '@/simulation/components/LabeledStepper';
import type { SimulationStepCode, SimulationStatus } from '@/simulation/types';

interface ProcessStepHeaderProps {
  currentStep: 1 | 2 | 3 | 4;
}

export default function ProcessStepHeader({ currentStep }: ProcessStepHeaderProps) {
  // 단계별 상태 매핑
  const steps: Array<{ stepCode: SimulationStepCode; status: SimulationStatus }> = [
    { stepCode: 'DOCUMENT_CHECK', status: currentStep >= 1 ? (currentStep === 1 ? 'IN_PROGRESS' : 'COMPLETED') : 'PENDING' },
    { stepCode: 'CREDIT_CHECK', status: currentStep >= 2 ? (currentStep === 2 ? 'IN_PROGRESS' : 'COMPLETED') : 'PENDING' },
    { stepCode: 'BUSINESS_PLAN', status: currentStep >= 3 ? (currentStep === 3 ? 'IN_PROGRESS' : 'COMPLETED') : 'PENDING' },
    { stepCode: 'FINAL_REVIEW', status: currentStep >= 4 ? (currentStep === 4 ? 'IN_PROGRESS' : 'COMPLETED') : 'PENDING' },
  ];

  return (
    <div className="bg-white">
      <LabeledStepper steps={steps} />
    </div>
  );
}