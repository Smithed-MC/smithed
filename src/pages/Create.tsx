import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, RowDiv, userData } from '..';
import { Pack, PackHelper } from '../Pack';
import CreatePackDisplay from '../components/CreatePackDisplay';
import { Route, Switch, useHistory, withRouter } from 'react-router';
import { StyledLabel } from '../Shared';
import { database } from '../shared/ConfigureFirebase';
import Edit, { PackWithMessages } from './Create/Edit';


interface CreateState {

    [key: string]: any
}

const AddDiv = styled.div`
    width: 84px;
    height: 84px;
    padding: 8px;
    -webkit-user-select: none;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background-color: var(--darkBackground);

    :hover {
        filter: brightness(90%);
    }
    :active {
        filter: brightness(80%);
    }
`


function Create(props: any) {
    const [packs, setPacks] = useState<PackWithMessages[]>([])
    const history = useHistory();

    const updatePacks = useCallback(() => {
        database.ref(`users/${userData.uid}/packs`).get().then(snapshot => {
            let databasePack: any[] = snapshot.val()
            try {
                let packs: PackWithMessages[] = []
                for (let p = 0; p < databasePack.length; p++)
                    packs.push(PackHelper.updatePackData(databasePack[p]) as PackWithMessages)

                console.log(packs)
                setPacks(packs)
            } catch {
                console.log('failed to load packs')
            }
        })
    }, [setPacks])


    useEffect(() => {
        updatePacks()
    }, [])



    const renderUsersPacks = () => {
        let elements: JSX.Element[] = []

        if (packs != null && packs.length > 0) {
            for (let p of packs) {
                if (p === null) continue;

                elements.push(<CreatePackDisplay pack={p} onClick={() => {
                    swapToAddPage(p)
                }} />)
            }
        }

        elements.push(<AddDiv className='rounded-lg' onClick={() => {
            swapToAddPage()
        }}>
            <StyledLabel className='text-text' style={{ fontSize: 96, textAlign: 'center', fontFamily: 'Disket-Bold' }}>+</StyledLabel>
        </AddDiv>)
        return elements
    }


    const swapToAddPage = (pack?: Pack) => {
        if(pack !== undefined)
            history.push(`/app/create/edit?id=${pack.id}&new=0`)
        else
            history.push(`/app/create/edit?new=1`)
    }

    // TODO: Split groupedfoldouts into their own files to make this nicer, might not work but oh well




    return (
        <ColumnDiv style={{ width: '100%', height: '100%', padding: 16 }}>
            <RowDiv style={{ display: 'inline-flex', height: '100%', width: '100%', flexWrap: 'wrap', justifyContent: 'left', gap: 12, alignContent: 'flex-start' }}>
                <Switch>
                    <Route path='/app/create/edit'><Edit packs={packs}/></Route>
                    <Route exact path='/app/create'>{renderUsersPacks()}</Route>
                </Switch>
            </RowDiv>
        </ColumnDiv>
    );
}

export default withRouter(Create);
