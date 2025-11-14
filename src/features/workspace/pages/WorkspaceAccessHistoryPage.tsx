import { useAppSelector } from '../../../store/hooks';
import { WorkspaceAccessHistory } from '../components/WorkspaceAccessHistory';

export const WorkspaceAccessHistoryPage = () => {
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);

  if (!currentWorkspace) {
    return (
      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
        <p className="text-warning-800 dark:text-warning-400">Please select a workspace first.</p>
      </div>
    );
  }

  return <WorkspaceAccessHistory workspaceId={currentWorkspace.workspaceId} />;
};

