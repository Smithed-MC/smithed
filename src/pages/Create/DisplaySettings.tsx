import RadioButton from "components/RadioButton";
import { ColumnDiv, StyledInput } from "index";
import { PackWithMessages } from "./Edit";

function DisplaySettings(props: { pack: PackWithMessages }) {
    const pack = props.pack
    return (
        <ColumnDiv style={{ width: '100%', alignItems: '', gap: 8 }}>
            <div>
                <RadioButton text="Hidden?" defaultValue={pack.display.hidden} onChange={(value) => {
                    pack.display.hidden = value;
                }} />
            </div>
            <ColumnDiv style={{ width: '100%', gap: 8 }}>
                <StyledInput className='w-full' placeholder='* Name...' defaultValue={pack.display.name} onChange={(e) => {
                    pack.display.name = e.target.value;
                }} />
                <StyledInput className='w-full' placeholder='Icon URL...' defaultValue={pack.display.icon} onChange={(e) => {
                    pack.display.icon = e.target.value;
                }} />
                <StyledInput className='w-full' placeholder='* Description...' defaultValue={pack.display.description} onChange={(e) => {
                    pack.display.description = e.target.value;
                }} />
                <StyledInput className='w-full' placeholder='Full View Markdown URL...' defaultValue={pack.display.webPage} onChange={(e) => {
                    pack.display.webPage = e.target.value;
                }} />
            </ColumnDiv>

        </ColumnDiv>);
}

export default DisplaySettings