import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { DashboardPage } from '#generated/types/graphql';
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
}

function PreparednessFilter({ value, onChange }: Props) {
    return (
        <>
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
        </>
    );
}

export default PreparednessFilter;
