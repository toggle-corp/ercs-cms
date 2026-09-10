import {
    Button,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import RegionSelectInput from '#components/RegionSelectInput';
import { AdminAreaLevel } from '#generated/types/graphql';
import useGlobalEnums from '#hooks/useGlobalEnums';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import type { PmerFilterType } from '..';

export interface Props {
    value: PmerFilterType;
    onChange: (...args: EntriesAsList<PmerFilterType>) => void;
    onReset: () => void;
    filtered: boolean;
}

function PmerFilters({
    value, onChange, onReset, filtered,
}: Props) {
    const {
        pmerReportCategory: categoryOptions,
        pmerReportDocumentType: reportTypeOptions,
    } = useGlobalEnums();

    return (
        <>
            <TextInput
                name="search"
                placeholder="Search by title, project and department"
                value={value.search}
                onChange={onChange}
            />
            <RegionSelectInput
                name="region"
                placeholder="Region"
                level={AdminAreaLevel.Region}
                value={value.region}
                onChange={onChange}
            />
            <SelectInput
                name="category"
                placeholder="Report Category"
                value={value.category}
                onChange={onChange}
                options={categoryOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
            />
            <SelectInput
                name="reportType"
                placeholder="Report Type"
                value={value.reportType}
                onChange={onChange}
                options={reportTypeOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
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

export default PmerFilters;
