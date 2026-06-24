import { useState } from 'react';
import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import RegionSearchMultiSelectInput, { type AdminAreaItem } from '#components/RegionSearchMultiSelectInput';
import { AdminAreaLevel } from '#generated/types/graphql';
import {
    labelSelector,
    statusFilterOptions,
    valueSelector,
} from '#utils/common';

import type { DashboardFilterType } from '../index';

export interface Props {
    value: DashboardFilterType;
    onChange: (...args: EntriesAsList<DashboardFilterType>) => void;
}

function ResourceDashboardsFilters({ value, onChange }: Props) {
    const [regionOptions, setRegionOptions] = useState<
        AdminAreaItem[] | undefined | null
    >([]);

    return (
        <>
            <RegionSearchMultiSelectInput
                name="regions"
                placeholder="Region"
                level={AdminAreaLevel.Region}
                value={value.regions}
                onOptionsChange={setRegionOptions}
                options={regionOptions}
                onChange={onChange}
            />
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

export default ResourceDashboardsFilters;
