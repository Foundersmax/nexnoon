import { motion } from "motion/react";
import { Award, Download, Linkedin } from "lucide-react";

export function CertificatePreview() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#889dd1]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Info */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-8 w-8 text-[#889dd1]" />
            <h2 className="text-3xl font-bold">Earn Your Certificate</h2>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">
            Upon completing all projects and assessments, you'll receive a verified certificate
            that showcases your advanced React skills to employers and on professional networks.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-[#889dd1]/20 rounded-lg p-2 flex-shrink-0">
                <Award className="h-5 w-5 text-[#889dd1]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Verified & Shareable</h4>
                <p className="text-sm text-gray-400">
                  Add to LinkedIn, your resume, and portfolio
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#889dd1]/20 rounded-lg p-2 flex-shrink-0">
                <Download className="h-5 w-5 text-[#889dd1]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Digital & PDF</h4>
                <p className="text-sm text-gray-400">
                  Download high-resolution certificate
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#889dd1]/20 rounded-lg p-2 flex-shrink-0">
                <Linkedin className="h-5 w-5 text-[#889dd1]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">LinkedIn Integration</h4>
                <p className="text-sm text-gray-400">
                  One-click share to your profile
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-gray-300">
              <strong className="text-white">98%</strong> of students who completed this course
              reported career advancement within 6 months
            </p>
          </div>
        </div>

        {/* Right: Certificate Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-[#889dd1]/30 to-purple-500/30 rounded-2xl blur-xl"></div>
          <div className="relative bg-white text-gray-900 rounded-2xl p-8 shadow-2xl border-4 border-gray-100">
            <div className="text-center space-y-4">
              {/* Header */}
              <div className="border-b-2 border-gray-200 pb-4">
                <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">N</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nexnoon</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Certificate of Completion
                </p>
              </div>

              {/* Body */}
              <div className="py-4 space-y-3">
                <p className="text-xs text-gray-500">This certifies that</p>
                <h4 className="text-2xl font-bold text-gray-900">Your Name</h4>
                <p className="text-xs text-gray-500">has successfully completed</p>
                <h5 className="text-base font-semibold text-gray-800">
                  Advanced React Patterns & Best Practices
                </h5>
                <p className="text-xs text-gray-500">on January 22, 2026</p>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-end">
                <div className="text-left">
                  <div className="w-24 h-0.5 bg-gray-900 mb-1"></div>
                  <p className="text-xs text-gray-600">Nexnoon Expert</p>
                  <p className="text-xs text-gray-400">Course Nexnoon Expert</p>
                </div>
                <div className="text-xs text-gray-400">
                  ID: NXN-2026-{Math.floor(Math.random() * 10000)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
