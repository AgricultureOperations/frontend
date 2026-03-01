interface Props {
    title: string
}
const CustomHeader = ({title}: Props) => {
  return (
    <div className='content-center'>
        <h1>{title}</h1>
    </div>
  )
}
export default CustomHeader;
