import {
    useEffect,
    useMemo,
} from 'react';
import {
    Image,
    RawFileInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

interface Props<N, T> {
    name: N;
    value: File | undefined;
    existingUrl?: string | null;
    onChange: (file: File | undefined, name: N) => void;
    error?: Error<T>;
    accept?: string;
    disabled?: boolean;
}

function CoverImageInput<N, T>(props: Props<N, T>) {
    const {
        name,
        value,
        existingUrl,
        onChange,
        error,
        accept = 'image/*',
        disabled,
    } = props;

    const preview = useMemo(() => {
        if (value instanceof File) {
            return URL.createObjectURL(value);
        }
        return existingUrl ?? undefined;
    }, [value, existingUrl]);

    useEffect(() => () => {
        if (value instanceof File && preview) {
            URL.revokeObjectURL(preview);
        }
    }, [preview, value]);

    return (
        <>
            <RawFileInput
                name={name}
                onChange={onChange}
                accept={accept}
                disabled={disabled}
                styleVariant="outline"
            >
                {isDefined(value) || isDefined(preview)
                    ? 'Change cover image'
                    : 'Upload cover image'}
            </RawFileInput>
            {isDefined(preview) && (
                <Image
                    src={preview}
                    alt="Cover image preview"
                    size="md"
                    withContainedFit
                />
            )}
            <NonFieldError error={error} />
        </>
    );
}

export default CoverImageInput;
