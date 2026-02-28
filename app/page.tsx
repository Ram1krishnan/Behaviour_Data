'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { userID, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartStudy = () => {
    if (userID) {
      router.push('/task/1');
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full shadow-lg">
        <CardHeader className="text-center border-b bg-white">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Prompt Engineering Research Study
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed">
              This system is designed for academic research purposes to study
              human-AI interaction patterns and prompt engineering behaviors.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700">
                  Your interactions will be recorded anonymously for research
                  analysis.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700">
                  No personal information is collected. Your data is completely
                  anonymous.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700">
                  You may refine prompts as many times as you want. There are no
                  limits on prompt refinements.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700">
                  Your participation helps improve understanding of human-AI
                  interaction and prompt engineering techniques.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-slate-700 font-medium">
                  By continuing, you consent to anonymous data collection for
                  research purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              onClick={handleStartStudy}
              size="lg"
              className="px-12 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Start Study
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
