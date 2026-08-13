import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Image,
    ListView,
    RawFileInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_IMAGE_SIZE,
    validateFile,
} from '#utils/common';

interface Props<N, T> {
    name: N;
    value: File | undefined;
    existingUrl?: string | null;
    onChange: (file: File | undefined, name: N) => void;
    error?: Error<T>;
    accept?: string;
    disabled?: boolean;
    maxSize?: number;
}

function CoverImageInput<N, T>(props: Props<N, T>) {
    const {
        name,
        value,
        existingUrl,
        onChange,
        error,
        accept = ACCEPTED_IMAGE_TYPES,
        disabled,
        maxSize = MAX_IMAGE_SIZE,
    } = props;

    const [validationError, setValidationError] = useState<string>();

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

    const handleChange = useCallback(
        (file: File | undefined, inputName: N) => {
            const message = isDefined(file)
                ? validateFile(file, maxSize, accept)
                : undefined;
            setValidationError(message);
            onChange(isDefined(message) ? undefined : file, inputName);
        },
        [onChange, maxSize, accept],
    );

    return (
        <ListView layout="block">
            <RawFileInput
                name={name}
                onChange={handleChange}
                accept={accept}
                disabled={disabled}
                styleVariant="outline"
            >
                {isDefined(preview) ? 'Change cover image' : 'Upload cover image'}
            </RawFileInput>
            {isDefined(preview) && (
                <Image
                    src={preview}
                    alt="Cover image preview"
                    size="md"
                    withContainedFit
                />
            )}
            <NonFieldError error={validationError ?? error} />
        </ListView>
    );
}

export default CoverImageInput;
