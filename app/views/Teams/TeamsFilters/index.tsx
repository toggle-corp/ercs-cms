import {
    Button,
    DateInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import type { TeamsFilterType } from '..';

export interface Props {
    value: TeamsFilterType;
    onChange: (...args: EntriesAsList<TeamsFilterType>) => void;
    onReset: () => void;
    filtered: boolean;
}

function TeamsFilters({
    value, onChange, onReset, filtered,
}: Props) {
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
                placeholder="Search"
                value={value.search}
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

export default TeamsFilters;
