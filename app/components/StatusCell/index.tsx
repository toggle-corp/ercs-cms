import { ListView } from '@ifrc-go/ui';

export interface Props {
    isActive: boolean;
}

function StatusCell({ isActive }: Props) {
    return (
        <ListView
            layout="inline"
            spacing="sm"
        >
            <span
                className={isActive
                    ? 'status-indicator-active'
                    : 'status-indicator-inactive'}
            />
            <span>{isActive ? 'Active' : 'Inactive'}</span>
        </ListView>
    );
}

export default StatusCell;
