import { type ReactNode } from 'react';
import {
    Button,
    ListView,
    Modal,
} from '@ifrc-go/ui';

export interface Props {
    heading?: ReactNode;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    pending?: boolean;
}

function ConfirmModal(props: Props) {
    const {
        heading = 'Confirm',
        message,
        confirmLabel = 'Okay',
        cancelLabel = 'Cancel',
        onConfirm,
        onCancel,
        pending,
    } = props;

    return (
        <Modal
            heading={heading}
            size="sm"
            onClose={onCancel}
            footer={(
                <ListView layout="inline" spacing="sm">
                    <Button
                        name={undefined}
                        onClick={onCancel}
                        disabled={pending}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        name={undefined}
                        styleVariant="filled"
                        onClick={onConfirm}
                        disabled={pending}
                    >
                        {confirmLabel}
                    </Button>
                </ListView>
            )}
        >
            {message}
        </Modal>
    );
}

export default ConfirmModal;
