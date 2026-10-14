import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../hooks/useProgressStore';
import { useToast } from '../hooks/useToast';
import { shareText } from '../services/share';
import { TOOLS, findTool } from '../workbenches/registry';

// This screen is only the grid, the routing and the share button. Each tool lives in src/workbenches
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
        <header className="w-full bg-surface-elevated/85 backdrop-blur-md border-b border-rule border-t-0 border-x-0 rounded-b-3xl shadow-surface-lg safe-top px-5 py-3.5 flex items-center gap-3">
          <motion.button
            type="button"
            aria-label="Back to workbenches"
            onClick={() => navigate('/workbenches')}
            whileTap={{ scale: 0.90 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="min-h-11 min-w-11 flex items-center justify-center -ml-1 rounded-full hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <div className={`p-2 rounded-xl ${activeTool.bgColor} shrink-0`}>
            <Icon className={`w-5 h-5 ${activeTool.accentColor}`} aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-title text-ink-primary truncate">{activeTool.title}</h2>
            <span className="text-meta text-ink-tertiary">{activeTool.phase} Workbench</span>
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

        {/* Tool content: a short intro, then the work. The icon is already in the header above. */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 pt-4 pb-3 text-body text-ink-secondary">{activeTool.description}</p>

          <div className="px-4 pb-28">
            <div className="bg-surface-elevated border border-rule rounded-2xl p-5 shadow-surface">
              <ToolBody />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid view ─────────────────────────────────────────────────────
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show:   { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-4 pb-28">
      <div className="mb-5">
        <h2 className="text-display text-ink-primary">Workbenches</h2>
        <p className="text-body text-ink-secondary mt-1">Working tools for each phase.</p>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <motion.button
              type="button"
              key={tool.id}
              variants={item}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => navigate(`/workbenches/${tool.id}`)}
              className="bg-surface-elevated border border-rule rounded-2xl p-4 flex flex-col items-start text-left shadow-surface hover:border-edge hover:-translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              <div className={`p-3 rounded-xl ${tool.bgColor} mb-3`}>
                <Icon className={`w-5 h-5 ${tool.accentColor}`} aria-hidden="true" />
              </div>
              <span className="text-kicker text-ink-tertiary">{tool.phase}</span>
              <h3 className="text-body font-semibold text-ink-primary leading-tight mt-1">{tool.title}</h3>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
