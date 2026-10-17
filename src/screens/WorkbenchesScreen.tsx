import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../hooks/useProgressStore';
import { useToast } from '../hooks/useToast';
import { shareText } from '../services/share';
import { findTool } from '../workbenches/registry';
import { ToolList } from '../workbenches/ToolList';

// This screen is only the contents list, the routing and the share button. Each tool lives in src/workbenches
// and reads and writes its own saved data.
export default function WorkbenchesScreen() {
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const activeTool = findTool(toolId);

  // ── Active tool view ───────────────────────────────────────────────
  if (activeTool) {
    const Icon = activeTool.icon;
    const ToolBody = activeTool.Component;

    const handleShare = async () => {
      // Read the saved data when asked, so typing in a tool never re-renders this screen.
      const text = activeTool.share?.(useProgressStore.getState().workbench[activeTool.id], new Date()) ?? null;
      if (!text) {
        showToast('Nothing to share yet. Fill in this workbench first.', 'info');
        return;
      }
      const outcome = await shareText(activeTool.title, text);
      if (outcome === 'copied') showToast('Copied to clipboard.', 'success');
      else if (outcome === 'failed') showToast('Could not share or copy this output.', 'danger');
    };

    return (
      <div className="flex flex-col h-full bg-surface-base">
        {/* Tool header */}
        <header className="flex w-full items-center gap-2 border-b border-rule px-1 py-2">
          <motion.button
            type="button"
            aria-label="Back to workbenches"
            onClick={() => navigate('/workbenches')}
            whileTap={{ scale: 0.90 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <Icon className="w-5 h-5 shrink-0 text-ink-primary" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-title text-ink-primary">{activeTool.title}</h2>
            <span className="text-meta text-ink-tertiary">{activeTool.phase}</span>
          </div>

          {activeTool.share && (
            <motion.button
              type="button"
              aria-label={`Share ${activeTool.title}`}
              onClick={handleShare}
              whileTap={{ scale: 0.90 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              <Share2 className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          )}
        </header>

        {/* Tool content: one line of intro, then the work sits on the page. A tool raises a panel only where you type. */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 pt-4 pb-4 text-body text-ink-secondary">{activeTool.description}</p>

          <div className="px-4 pb-28">
            <ToolBody />
          </div>
        </div>
      </div>
    );
  }

  // ── Contents list ─────────────────────────────────────────────────
  return (
    <div className="p-4 pb-28">
      <h2 className="text-display text-ink-primary">Workbenches</h2>
      <p className="mt-1 mb-5 text-body text-ink-secondary">Working tools for each phase.</p>
      <ToolList />
    </div>
  );
}
