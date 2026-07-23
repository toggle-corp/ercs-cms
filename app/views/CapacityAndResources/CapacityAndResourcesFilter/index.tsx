import {
    Button,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import {
    labelSelector,
    statusFilterOptions,
    valueSelector,
} from '#utils/common';

import type { ResourcesFilterType } from '../index';

export interface Props {
    value: ResourcesFilterType;
    onChange: (...args: EntriesAsList<ResourcesFilterType>) => void;
    filtered: boolean;
    onReset: () => void;
}

function CapacityAndResourcesFilter({
    value,
    onChange,
    filtered,
    onReset,
}: Props) {
    return (
        <>
            <SelectInput
                name="isActive"
                placeholder="Status"
                value={value.isActive}
                onChange={onChange}
                options={statusFilterOptions}
                keySelector={valueSelector}
                labelSelector={labelSelector}
            />
            <TextInput
                name="search"
                placeholder="Search by title"
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

export default CapacityAndResourcesFilter;
