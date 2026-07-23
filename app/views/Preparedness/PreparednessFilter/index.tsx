import { useState } from 'react';
import {
    Button,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import RegionSearchMultiSelectInput, { type AdminAreaItem } from '#components/RegionSearchMultiSelectInput';
import {
    AdminAreaLevel,
    DashboardPage,
} from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
    statusFilterOptions,
    valueSelector,
} from '#utils/common';

import type { PreparednessFilterType } from '../index';

const pageOptions = [
    { key: DashboardPage.EmergencyAlerts, label: 'Emergency Alerts' },
    { key: DashboardPage.DisasterResponse, label: 'Disaster Responses' },
];

export interface Props {
    value: PreparednessFilterType;
    onChange: (...args: EntriesAsList<PreparednessFilterType>) => void;
    filtered: boolean;
    onReset: () => void;
}

function PreparednessFilter({
    value,
    onChange,
    filtered,
    onReset,
}: Props) {
    const [regionOptions, setRegionOptions] = useState<
        AdminAreaItem[] | undefined | null
    >([]);

    return (
        <>
            <RegionSearchMultiSelectInput
                name="regions"
                placeholder="Regions"
                level={AdminAreaLevel.Region}
                value={value.regions}
                onOptionsChange={setRegionOptions}
                options={regionOptions}
                onChange={onChange}
            />
            <SelectInput
                name="page"
                placeholder="Operation"
                value={value.page}
                onChange={onChange}
                options={pageOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
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

export default PreparednessFilter;
