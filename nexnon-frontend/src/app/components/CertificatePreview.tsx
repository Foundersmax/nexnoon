import { motion } from "motion/react";
import { Award, Download, Linkedin } from "lucide-react";

export function CertificatePreview({ title = 'Course title', instructor = 'Nexnoon Expert', information = 'The instructor has not provided certificate information yet.' }: { title?: string; instructor?: string; information?: string }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-12 text-white relative overflow-hidden">
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
            {information}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"><p className="text-sm text-gray-300">Design preview only. Certificate availability and completion requirements are described by your instructor above.</p></div>
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
                  {title}
                </h5>
                <p className="text-xs text-gray-500">Completion date</p>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-end">
                <div className="text-left">
                  <div className="w-24 h-0.5 bg-gray-900 mb-1"></div>
                  <p className="text-xs text-gray-600">{instructor}</p>
                  <p className="text-xs text-gray-400">Course Nexnoon Expert</p>
                </div>
                <div className="text-xs text-gray-400">
                  PREVIEW
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
