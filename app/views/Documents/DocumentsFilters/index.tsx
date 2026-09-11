import {
    Button,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import type { DocumentFilterType } from '..';

export interface Props {
    value: DocumentFilterType;
    onChange: (...args: EntriesAsList<DocumentFilterType>) => void;
    onReset: () => void;
    filtered: boolean;
}

function DocumentsFilters({
    value, onChange, onReset, filtered,
}: Props) {
    return (
        <>
            <TextInput
                name="title"
                placeholder="Search by title"
                value={value.title}
                onChange={onChange}
            />
            <Button
                name={undefined}
                onClick={onReset}
                title="Reset"
                disabled={!filtered}
            >
                Reset
            </Button>
        </>
    );
}

export default DocumentsFilters;
