import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Button,
    DateInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type GalleryAlbumsFilterType } from '../index';

export interface Props {
    value: GalleryAlbumsFilterType;
    onChange: (...args: EntriesAsList<GalleryAlbumsFilterType>) => void;
    filtered: boolean;
    onReset: () => void;
}

function GalleryFilter({
    value,
    onChange,
    filtered,
    onReset,
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
                icons={<SearchLineIcon />}
                variant="general"
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

export default GalleryFilter;
