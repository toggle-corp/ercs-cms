import { useState } from 'react';
import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import RegionSearchMultiSelectInput, { type AdminAreaItem } from '#components/RegionSearchMultiSelectInput';
import {
    AdminAreaLevel,
    type ThematicAreasQuery,
} from '#generated/types/graphql';
import {
    idSelector,
    nameSelector,
} from '#utils/common';

import type { DataAndReportsFilterType } from '../index';

type ThematicAreaOption = NonNullable<ThematicAreasQuery['thematicAreas']['results'][number]>;

export interface Props {
    value: DataAndReportsFilterType;
    onChange: (...args: EntriesAsList<DataAndReportsFilterType>) => void;
    thematicAreaOptions: ThematicAreaOption[] | undefined;
}

function DataAndReportsFilters({ value, onChange, thematicAreaOptions }: Props) {
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
                name="thematicAreaId"
                placeholder="Category"
                value={value.thematicAreaId}
                onChange={onChange}
                options={thematicAreaOptions}
                keySelector={idSelector}
                labelSelector={nameSelector}
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

export default DataAndReportsFilters;
