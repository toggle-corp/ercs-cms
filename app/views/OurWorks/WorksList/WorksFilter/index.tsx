import { useMemo } from 'react';
import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import {
    DashboardPage,
    useDashboardEnumsQuery,
} from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
    statusFilterOptions,
    valueSelector,
} from '#utils/common';

import type { WorksFilterType } from '../index';

export interface Props {
    value: WorksFilterType;
    onChange: (...args: EntriesAsList<WorksFilterType>) => void;
}

function WorksFilter({ value, onChange }: Props) {
    const [{ data: enumsData }] = useDashboardEnumsQuery();

    const pageOptions = useMemo(
        () => enumsData?.enums?.DashboardPage?.filter(
            (option) => option.key !== DashboardPage.EmergencyAlerts
                && option.key !== DashboardPage.DisasterResponse,
        ),
        [enumsData],
    );

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

export default WorksFilter;
