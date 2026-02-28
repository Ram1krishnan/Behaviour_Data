'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

export default function CompletePage() {
  const router = useRouter();
  const { userID, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!userID) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardHeader className="text-center border-b bg-white">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">
            Study Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-slate-700">
              Thank you for participating in this research study!
            </p>
            <p className="text-slate-600">
              Your responses have been recorded anonymously and will contribute to
              important research on prompt engineering and human-AI interaction.
            </p>
            <div className="pt-6 space-y-3">
              <p className="text-sm text-slate-500">
                Your anonymous User ID:
              </p>
              <p className="font-mono text-sm bg-slate-100 p-3 rounded border border-slate-300">
                {userID}
              </p>
            </div>
            <div className="pt-6">
              <Button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
