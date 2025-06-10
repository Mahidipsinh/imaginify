'use client';

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React, { useState } from 'react'

type CloudinaryImageOptions = {
    width?: number;
    height?: number;
    src: string;
    crop?: "fill" | "auto" | "crop" | "fill_pad" | "fit" | "imagga_crop" | "imagga_scale" | "lfill" | "limit" | "lpad" | "mfit" | "mpad" | "pad" | "scale" | "thumb";
    gravity?: "auto" | "center" | "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west";
    format?: "auto" | "webp" | "jpg" | "png" | "gif";
    quality?: "auto" | number;
    fetch_format?: "auto" | "webp" | "jpg" | "png" | "gif";
    [key: string]: any;
};

function TransformedImage({ image, type, title, isTransforming, setIsTransforming, transformationConfig, hasDownload = false }: TransformedImageProps) {
    const [error, setError] = useState<string | null>(null);

    const convertToCloudinaryOptions = (config: Transformations | null): Omit<CloudinaryImageOptions, 'src'> => {
        if (!config) return {};
        
        const options: Omit<CloudinaryImageOptions, 'src'> = {
            width: image?.width,
            height: image?.height,
        };

        if (config.crop) options.crop = config.crop as CloudinaryImageOptions['crop'];
        if (config.gravity) options.gravity = config.gravity as CloudinaryImageOptions['gravity'];
        if (config.format) options.format = config.format as CloudinaryImageOptions['format'];
        if (config.quality) options.quality = config.quality === 'auto' ? 'auto' : Number(config.quality);
        if (config.fetch_format) options.fetch_format = config.fetch_format as CloudinaryImageOptions['fetch_format'];

        return options;
    };

    const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        try {
            const imageOptions: CloudinaryImageOptions = {
                src: image?.publicId || '',
                ...convertToCloudinaryOptions(transformationConfig)
            };
            download(getCldImageUrl(imageOptions), title);
        } catch (err) {
            console.error('Download failed:', err);
            setError('Failed to download image');
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex-between'>
                <h3 className='h3-bold text-dark-600'>
                    Transformed
                </h3>

                {hasDownload && !error && (
                    <button
                        className='download-btn'
                        onClick={downloadHandler}
                    >
                        <Image
                            src='/assets/icons/download.svg'
                            alt='Download'
                            width={24}
                            height={24}
                            className='pb-[6px]'
                        />
                    </button>
                )}
            </div>

            {error ? (
                <div className='transformed-placeholder error'>
                    {error}
                </div>
            ) : image?.publicId && transformationConfig ? (
                <div className='relative'>
                    <CldImage
                        width={getImageSize(type, image, 'width')}
                        height={getImageSize(type, image, 'height')}
                        src={image?.publicId}
                        alt={image.title}
                        sizes={'(max-width: 767px) 100vw , 50vw'}
                        placeholder={dataUrl as PlaceholderValue}
                        className='transformed-image'
                        onLoad={() => {
                            setIsTransforming && setIsTransforming(false);
                            setError(null);
                        }}
                        onError={(e) => {
                            console.error('Image transformation failed:', e);
                            setError('Failed to transform image');
                            setIsTransforming && setIsTransforming(false);
                        }}
                        {...convertToCloudinaryOptions(transformationConfig)}
                    />
                    {isTransforming && (
                        <div className='transforming-loader'>
                            <Image
                                src='/assets/icons/spinner.svg'
                                alt='Transforming'
                                width={50}
                                height={50}
                            />
                            <p className='text-white/80'>Please Wait....</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className='transformed-placeholder'>
                    Transformed Image
                </div>
            )}
        </div>
    )
}

export default TransformedImage