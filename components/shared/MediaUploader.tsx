'use client'

import React from 'react'
import { useToast } from "@/hooks/use-toast"
import { CldImage, CldUploadWidget, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import Image from 'next/image';
import { dataUrl, getImageSize } from '@/lib/utils';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';

type MediaUploaderProps = {
    onChange: (value: string) => void;
    setImage: React.Dispatch<React.SetStateAction<any>>;
    image: any;
    publicId: string;
    type: string;
}

function MediaUploader({ onChange, setImage, image, publicId, type }: MediaUploaderProps) {
    const { toast } = useToast();

    const onUploadSuccessHandler = (result: CloudinaryUploadWidgetResults) => {
        try {
            if (!result.info || typeof result.info === 'string') {
                throw new Error('Invalid upload result');
            }

            const info = result.info as CloudinaryUploadWidgetInfo;
            
            setImage((prevState: any) => ({
                ...prevState,
                publicId: info.public_id,
                width: info.width,
                height: info.height,
                secureURL: info.secure_url
            }));

            onChange(info.public_id);

            toast({
                title: "Image Uploaded Successfully",
                description: "1 credit is deducted from your account",
                duration: 5000,
                className: 'success-toast'
            });
        } catch (error) {
            console.error('Error handling upload:', error);
            toast({
                title: "Error Processing Upload",
                description: "There was an error processing your upload. Please try again.",
                duration: 5000,
                className: 'error-toast'
            });
        }
    }

    const onUploadErrorHandler = (error: any) => {
        console.error('Upload error:', error);
        toast({
            title: "Upload Failed",
            description: "There was an error uploading your image. Please try again.",
            duration: 5000,
            className: 'error-toast'
        });
    }

    return (
        <CldUploadWidget
            uploadPreset='imaginify'
            options={{
                multiple: false,
                resourceType: 'image',
                maxFileSize: 10485760, // 10MB
                showAdvancedOptions: true,
                styles: {
                    palette: {
                        window: "#FFFFFF",
                        windowBorder: "#90A0B3",
                        tabIcon: "#0078FF",
                        menuIcons: "#5A616A",
                        textDark: "#000000",
                        textLight: "#FFFFFF",
                        link: "#0078FF",
                        action: "#FF620C",
                        inactiveTabIcon: "#0E2F5A",
                        error: "#F44235",
                        inProgress: "#0078FF",
                        complete: "#20B832",
                        sourceBg: "#E4EBF1"
                    }
                }
            }}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
            {({ open }) => (
                <div className='flex flex-col gap-4'>
                    <h3 className='h3-bold text-dark-600'>
                        Original
                    </h3>

                    {publicId ? (
                        <div className='cursor-pointer overflow-hidden rounded-[10px]'>
                            <CldImage
                                width={getImageSize(type, image, 'width')}
                                height={getImageSize(type, image, 'height')}
                                src={publicId}
                                alt='Image'
                                sizes={'(max-width: 767px) 100vw , 50vw'}
                                placeholder={dataUrl as PlaceholderValue}
                                className='media-uploader_cldImage'
                            />
                        </div>
                    ) : (
                        <div className='media-uploader_cta' onClick={() => open()}>
                            <div className='media-upload_cta-image'>
                                <Image
                                    src='/assets/icons/add.svg'
                                    alt='Add Image'
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <p className='p-14-medium'>
                                Click here to Upload Image
                            </p>
                        </div>
                    )}
                </div>
            )}
        </CldUploadWidget>
    )
}

export default MediaUploader