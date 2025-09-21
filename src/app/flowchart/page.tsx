'use client';

import { FlowchartEditor } from '@/components/flow/FlowchartCanvas';

export default function FlowchartPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Flowchart Editor</h1>
      <div className="bg-background rounded-lg border">
        <FlowchartEditor />
      </div>
    </div>
  );
}
