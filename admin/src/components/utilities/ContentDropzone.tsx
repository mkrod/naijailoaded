import { type FC, type ReactNode } from "react";
import { useDropzone } from "react-dropzone";

interface ContentDropzoneProps {
    index: number;
    onDropFile: (index: number, file: File) => void;
    children: (p: {
        getRootProps: any;
        getInputProps: any;
        isDragActive: boolean;
    }) => ReactNode;
}

const ContentDropzone: FC<ContentDropzoneProps> = ({ index, onDropFile, children }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [], "video/*": [], "audio/*": [] },
        multiple: false,
        onDrop: (files) => {
            if (files[0]) onDropFile(index, files[0]);
        },
    });

    return children({ getRootProps, getInputProps, isDragActive });
};

export default ContentDropzone;