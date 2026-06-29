import {
    DateInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import type { DocumentFilterType } from '..';

export interface Props {
    value: DocumentFilterType;
    onChange: (...args: EntriesAsList<DocumentFilterType>) => void;
}

function DocumentsFilters({ value, onChange }: Props) {
    return (
        <>
            <DateInput
                name="createdAtGte"
                label="Created at start date"
                value={value.createdAtGte}
                onChange={onChange}
            />
            <DateInput
                name="createdAtLte"
                label="Created at end date"
                value={value.createdAtLte}
                onChange={onChange}
            />
            <TextInput
                name="search"
                placeholder="Search by title"
                value={value.search}
                onChange={onChange}
            />
        </>
    );
}

export default DocumentsFilters;
