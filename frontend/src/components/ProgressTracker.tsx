import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useQuote } from '../context/QuoteContext';
import clsx from 'clsx';

const Step = ({ number, title, path, isActive, isCompleted, isClickable }: { number: number, title: string, path: string, isActive: boolean, isCompleted: boolean, isClickable: boolean }) => {
  const stepContent = (
    <div className={clsx(
      "flex items-center gap-2 p-2 rounded-lg transition-all duration-300",
      isActive && "bg-blue-50 shadow-md",
      isClickable ? "cursor-pointer hover:bg-blue-100/50" : "cursor-not-allowed opacity-60"
    )}>
      <div className={clsx(
        "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0",
        isActive ? "border-blue-600 bg-blue-600 text-white" :
          isCompleted ? "border-green-500 bg-green-500 text-white" :
            "border-gray-300 bg-gray-100 text-gray-600"
      )}>
        {isCompleted ? (
          <CheckCircle2 size={20} />
        ) : (
          <span className="text-sm font-semibold">{number}</span>
        )}
      </div>
      <span className={clsx(
        "text-sm font-medium hidden sm:block",
        isActive ? "text-blue-700" :
          isCompleted ? "text-green-600" :
            "text-gray-500"
      )}>
        {title}
      </span>
    </div>
  );

  return isClickable ? (
    <Link href={path} className="outline-none">
      {stepContent}
    </Link>
  ) : (
    <div>{stepContent}</div>
  );
};

const Connector = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className={clsx(
      "w-1 bg-gray-200 transition-colors duration-300",
      isActive && "bg-blue-600"
    )} />
  );
};

interface ProgressTrackerProps {
  admin?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ admin = false }) => {
  const pathname = usePathname();
  const { state } = useQuote();

  const customerSteps = [
    { number: 1, title: "Get Quote", path: "/quote-generator", isCompleted: state.step1Complete },
    { number: 2, title: "Event Details", path: "/event-information", isCompleted: state.step2Complete },
    { number: 3, title: "Policy Holder", path: "/policy-holder", isCompleted: state.step3Complete },
    { number: 4, title: "Review", path: "/review", isCompleted: false },
  ];

  const adminSteps = [
    { number: 1, title: "Customer Info", path: "/admin/create-quote/step1", isCompleted: state.step1Complete },
    { number: 2, title: "Event Details", path: "/admin/create-quote/step2", isCompleted: state.step2Complete },
    { number: 3, title: "Coverage Options", path: "/admin/create-quote/step3", isCompleted: state.step3Complete },
    { number: 4, title: "Review & Submit", path: "/admin/create-quote/step4", isCompleted: false },
  ];

  const steps = admin ? adminSteps : customerSteps;

  const currentStepIndex = steps.findIndex(step => pathname === step.path);

  return (
    // Removed mx-auto, w-[64%], and px-2.
    // It will now inherit width/margins from its parent in CustomerLayout.
    // py-4 is for its own internal vertical spacing.
    <div className="py-4">
      <div className="w-full bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-row gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.path}>
              <div className="flex-1 min-w-0">
                <Step
                  number={step.number}
                  title={step.title}
                  path={step.path}
                  isActive={currentStepIndex === index}
                  isCompleted={step.isCompleted}
                  isClickable={
                    index <= currentStepIndex ||
                    (index === currentStepIndex + 1 && steps[currentStepIndex]?.isCompleted)
                  }
                />
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center h-8">
                  <Connector
                    isActive={
                      currentStepIndex > index ||
                      (currentStepIndex === index && step.isCompleted)
                    }
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;