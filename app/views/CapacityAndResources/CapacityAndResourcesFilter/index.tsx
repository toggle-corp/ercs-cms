import {
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
}

function CapacityAndResourcesFilter({ value, onChange }: Props) {
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
        </>
    );
}

export default CapacityAndResourcesFilter;
