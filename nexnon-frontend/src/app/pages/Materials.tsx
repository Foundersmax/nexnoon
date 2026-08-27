import { useParams, useNavigate } from 'react-router';
import { Download, FileText, Image, Code, Video, File, Folder } from 'lucide-react';
import { classDetailUrl } from '@/lib/url';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';

const materials = [
  {
    id: 1,
    name: 'Week 1',
    type: 'folder',
    items: [
      { id: 11, name: 'Introduction Slides.pdf', type: 'pdf', size: '2.5 MB', downloads: 234 },
      { id: 12, name: 'Code Examples.zip', type: 'zip', size: '1.2 MB', downloads: 189 },
      { id: 13, name: 'Cheat Sheet.png', type: 'image', size: '450 KB', downloads: 312 },
    ]
  },
  {
    id: 2,
    name: 'Week 2',
    type: 'folder',
    items: [
      { id: 21, name: 'Advanced Hooks.pdf', type: 'pdf', size: '3.1 MB', downloads: 198 },
      { id: 22, name: 'Custom Hook Examples.js', type: 'code', size: '45 KB', downloads: 156 },
      { id: 23, name: 'Performance Tips.pdf', type: 'pdf', size: '1.8 MB', downloads: 203 },
    ]
  },
  {
    id: 3,
    name: 'Resources',
    type: 'folder',
    items: [
      { id: 31, name: 'React Documentation.pdf', type: 'pdf', size: '5.2 MB', downloads: 402 },
      { id: 32, name: 'Recommended Reading List.txt', type: 'txt', size: '12 KB', downloads: 298 },
    ]
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'folder': return Folder;
    case 'pdf': return FileText;
    case 'image': return Image;
    case 'code': return Code;
    case 'video': return Video;
    default: return File;
  }
};

export default function Materials() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-8">
        <div className="w-[90vw] max-w-5xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(classDetailUrl(id!, undefined))}
              className="mb-4"
            >
              ← Back to Class
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Materials</h1>
            <p className="text-gray-600">Download slides, code, and resources</p>
          </div>

          <div className="space-y-6">
            {materials.map((folder) => (
              <div key={folder.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-[#889dd1]" />
                    <h3 className="font-bold text-gray-900">{folder.name}</h3>
                  </div>
                  <span className="text-sm text-gray-600">{folder.items.length} files</span>
                </div>

                <div className="divide-y divide-gray-200">
                  {folder.items.map((item) => {
                    const Icon = getIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">{item.size}</span>
                              <span className="text-sm text-gray-500">{item.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Download All */}
          <div className="mt-8 text-center">
            <Button className="bg-[#889dd1] hover:bg-[#7a8ec2]">
              <Download className="h-5 w-5 mr-2" />
              Download All Materials
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
