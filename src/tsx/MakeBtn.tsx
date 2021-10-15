interface MakeBtnProps {
    name: string;
    url: string;
}

const MakeBtn: React.FC<MakeBtnProps> = ({ name, url }) => <a href={url} download={name}>{name}</a>;

export default MakeBtn;