/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Check, FileText, Sparkles, Loader2 } from 'lucide-react';
import { StudentProfile } from '../types';

interface ResumeUploadModalProps {
  onClose: () => void;
  onUploadSuccess: (profile: StudentProfile) => void;
  token: string;
}

export default function ResumeUploadModal({ onClose, onUploadSuccess, token }: ResumeUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [parseResult, setParseResult] = useState<{
    skills: string[];
    education: string[];
    experience: string[];
  } | null>(null);

  const templates = [
    {
      name: 'Cloud Engineer Template',
      text: 'Alex Rivera\nStanford University Computer Science BS\nJunior Developer at Google\nSkills: React, TypeScript, Node.js, AWS, Docker, Kubernetes, PostgreSQL, Git\nAWS Certified Developer certification obtained in 2023.'
    },
    {
      name: 'Data Scientist Template',
      text: 'Sofia Chen\nUniversity of Texas at Austin Data Science MS\nBackend Systems Intern at Stripe\nSkills: Python, PostgreSQL, TypeScript, Git, Docker, Flask\nCertified Python Programmer.'
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setCustomText(`Scanned from ${file.name}. \nFull tech stack developer: React, Node.js, PostgreSQL, Docker, AWS.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setCustomText(`Scanned from ${file.name}. \nSoftware Engineer profile. Core technologies: React, TypeScript, Node.js, PostgreSQL, Docker.`);
    }
  };

  const selectTemplate = (index: number) => {
    setSelectedTemplate(templates[index].name);
    setFileName(`${templates[index].name.toLowerCase().replace(/ /g, '_')}_resume.pdf`);
    setCustomText(templates[index].text);
  };

  const handleParseSubmit = async () => {
    if (!customText) return;
    setLoading(true);

    try {
      const response = await fetch('/api/profile/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: fileName || 'uploaded_resume.pdf',
          resumeText: customText
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Parsing failed');

      setParseResult(data.extracted);
      onUploadSuccess(data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" id="resume-upload-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg glass-panel border border-slate-900 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5 overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Resume Analyzer Engine
          </h3>
          <p className="text-xs text-gray-400">Upload documents or select premade mock CVs to simulate deterministic skill extraction.</p>
        </div>

        {!parseResult ? (
          <div className="flex flex-col gap-4">
            {/* Drag & Drop */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'}`}
            >
              <Upload className="w-8 h-8 text-emerald-400" />
              <div className="text-xs text-gray-300 font-semibold">
                {fileName ? `File Selected: ${fileName}` : 'Drag & drop resume file here'}
              </div>
              <div className="text-[10px] text-gray-500">PDF, DOCX, or TXT formats supported</div>
              <label className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-300 text-[10px] cursor-pointer border border-slate-800">
                Browse Files
                <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt" />
              </label>
            </div>

            {/* Quick Template Selections */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-400 font-semibold uppercase font-mono">SIMULATION TEMPLATES</span>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => selectTemplate(i)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${selectedTemplate === tmpl.name ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'}`}
                  >
                    <span className="text-xs font-bold text-gray-200">{tmpl.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono truncate">Simulates parsed CV skills</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Edit raw parsed contents */}
            {customText && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase font-mono">CV TEXT PREVIEW</span>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  rows={4}
                  className="w-full glass-input rounded-xl p-2.5 text-xs font-mono resize-none"
                  placeholder="Review scanned text..."
                />
              </div>
            )}

            <button
              onClick={handleParseSubmit}
              disabled={loading || !customText}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing Skill Trees (Deterministic)...</span>
                </>
              ) : (
                'Execute Parse'
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 py-2"
          >
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Parser Complete</div>
                <div className="text-[10px] text-gray-400">Profile synchronized and saved successfully.</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {parseResult.skills.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">EXTRACTED SKILLS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parseResult.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parseResult.education.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">EXTRACTED EDUCATION</span>
                  {parseResult.education.map((e, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}

              {parseResult.experience.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">EXTRACTED EXPERIENCE</span>
                  {parseResult.experience.map((ex, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-gray-200 hover:text-white text-xs font-semibold mt-2 transition-colors"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
