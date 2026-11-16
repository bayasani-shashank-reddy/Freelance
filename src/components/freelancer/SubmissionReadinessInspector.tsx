import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface SubmissionReadinessInspectorProps {
  file: File | null;
  onValidationChange?: (isValid: boolean) => void;
}

export const SubmissionReadinessInspector: React.FC<SubmissionReadinessInspectorProps> = ({
  file,
  onValidationChange
}) => {
  const [readmeIncluded, setReadmeIncluded] = useState(true);
  const [installGuideIncluded, setInstallGuideIncluded] = useState(true);
  const [envTemplateIncluded, setEnvTemplateIncluded] = useState(true);
  const [noSecretsIncluded, setNoSecretsIncluded] = useState(true);

  const isZip = file ? file.name.toLowerCase().endsWith('.zip') : false;
  const isSizeOk = file ? file.size <= 100 * 1024 * 1024 : false; // 100MB limit
  const isReady = isZip && isSizeOk && readmeIncluded && installGuideIncluded && envTemplateIncluded && noSecretsIncluded;

  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isReady);
    }
  }, [isReady, onValidationChange]);

  return (
    <div className="p-5 rounded-2xl bg-[#F8F9FD] border border-[#E9EAF0] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9EAF0]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7357FF]" />
          <h4 className="font-bold text-xs text-[#222438] uppercase tracking-wider font-mono">
            Pre-Flight Deliverable Inspector
          </h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          isReady ? 'bg-[#24A675]/15 text-[#24A675]' : 'bg-amber-100 text-amber-800'
        }`}>
          {isReady ? 'INSPECTION PASSED' : 'CHECKLIST PENDING'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Archive Format */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E9EAF0]">
          <span className="text-[#55586A]">Archive Format (.ZIP)</span>
          <span className={`font-bold font-mono ${isZip ? 'text-[#24A675]' : 'text-red-500'}`}>
            {file ? (isZip ? 'VALID .ZIP' : 'INVALID EXTENSION') : 'AWAITING FILE'}
          </span>
        </div>

        {/* Size Check */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E9EAF0]">
          <span className="text-[#55586A]">Payload Size (&lt;100MB)</span>
          <span className={`font-bold font-mono ${isSizeOk ? 'text-[#24A675]' : 'text-red-500'}`}>
            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '—'}
          </span>
        </div>
      </div>

      {/* Package Contents Checklist */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold text-[#777B8A] uppercase tracking-wider block">
          Required Deliverable Artifacts
        </span>

        <label className="flex items-center gap-2 text-xs text-[#222438] cursor-pointer">
          <input
            type="checkbox"
            checked={readmeIncluded}
            onChange={e => setReadmeIncluded(e.target.checked)}
            className="rounded border-[#E9EAF0] text-[#7357FF] focus:ring-[#7357FF]"
          />
          <span>README.md documentation attached in root</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#222438] cursor-pointer">
          <input
            type="checkbox"
            checked={installGuideIncluded}
            onChange={e => setInstallGuideIncluded(e.target.checked)}
            className="rounded border-[#E9EAF0] text-[#7357FF] focus:ring-[#7357FF]"
          />
          <span>Installation and dependencies build steps documented</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#222438] cursor-pointer">
          <input
            type="checkbox"
            checked={envTemplateIncluded}
            onChange={e => setEnvTemplateIncluded(e.target.checked)}
            className="rounded border-[#E9EAF0] text-[#7357FF] focus:ring-[#7357FF]"
          />
          <span>Environment variables template (.env.example) included</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#222438] cursor-pointer">
          <input
            type="checkbox"
            checked={noSecretsIncluded}
            onChange={e => setNoSecretsIncluded(e.target.checked)}
            className="rounded border-[#E9EAF0] text-[#7357FF] focus:ring-[#7357FF]"
          />
          <span>No plain-text API secrets, node_modules, or .git repo bundled</span>
        </label>
      </div>

      <p className="text-[10px] text-[#777B8A] pt-1 border-t border-[#E9EAF0]">
        Advisory verification check: Ensures rapid administrative approval and client acceptance without revision cycles.
      </p>
    </div>
  );
};
