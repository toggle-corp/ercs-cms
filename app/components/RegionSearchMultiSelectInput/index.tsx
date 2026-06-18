import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    SearchMultiSelectInput,
    type SearchMultiSelectInputProps,
} from '@ifrc-go/ui';
import { unique } from '@togglecorp/fujs';

import {
    AdminAreaLevel,
    type AdminAreasQuery,
    useAdminAreasQuery,
} from '#generated/types/graphql';
import {
    idSelector,
    nameSelector,
    type REGION_LEVEL,
    type WOREDA_LEVEL,
    type ZONE_LEVEL,
} from '#utils/common';

export type AdminAreaItem = NonNullable<NonNullable<AdminAreasQuery['adminAreas']>['results']>[number];

type Def = { containerClassName?: string; };
type RegionSearchMultiSelectInputProps<NAME> = SearchMultiSelectInputProps<
    string,
    NAME,
    AdminAreaItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending'
    | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
    | 'selectedOnTop'
> & {
    level: REGION_LEVEL | ZONE_LEVEL | WOREDA_LEVEL;
};

function RegionSearchMultiSelectInput<const NAME>(
    props: RegionSearchMultiSelectInputProps<NAME>,
) {
    const {
        className,
        name,
        value,
        onChange,
        onOptionsChange,
        level = AdminAreaLevel.Region,
        disabled,
        readOnly,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);

    const [{ data: adminAreasData, fetching }] = useAdminAreasQuery({
        pause: !opened,
        variables: {
            filters: {
                level,
            },
        },
    });

    const regionOptions = useMemo(
        () => adminAreasData?.adminAreas?.results ?? [],
        [adminAreasData?.adminAreas?.results],
    );

    const handleSelectAllClick = useCallback(() => {
        const allIds = regionOptions.map(idSelector);
        if (allIds.length > 0) {
            onChange(allIds, name);
            if (onOptionsChange) {
                onOptionsChange((existingOptions) => {
                    const safeOptions = existingOptions ?? [];
                    return unique([...safeOptions, ...regionOptions], idSelector);
                });
            }
        }
    }, [regionOptions, onChange, name, onOptionsChange]);

    return (
        <SearchMultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            value={value}
            onChange={onChange}
            onOptionsChange={onOptionsChange}
            searchOptions={regionOptions}
            keySelector={idSelector}
            labelSelector={nameSelector}
            onShowDropdownChange={setOpened}
            optionsPending={fetching}
            totalOptionsCount={regionOptions.length}
            disabled={disabled}
            readOnly={readOnly}
            selectedOnTop={false}
            onSelectAllButtonClick={handleSelectAllClick}
        />
    );
}

export default RegionSearchMultiSelectInput;
