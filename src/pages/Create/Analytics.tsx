import { userData } from 'index';
import { Pack, PackHelper } from 'Pack';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { database } from 'shared/ConfigureFirebase';
export default function Analytics({ pack }: { pack: Pack }) {
    const [prev30Data, setPrev30Data] = useState<any[] | undefined>(undefined)
    const [totalDownloads, setTotalDownloads] = useState<number>(0)
    const [todayDownloads, setTodayDownloads] = useState<number>(0)
    const [percentChange, setPercentChange] = useState<number>(0)
    useEffect(() => {
        (async () => {
            const id = await PackHelper.sanitizeStringToFirebaseKey(userData.displayName)
            const ref = database.ref(`packs/${id}:${pack.id}/downloads`)
            const downloadsSnap = await ref.get()
            if (!downloadsSnap.exists()) return;
            const downloads = downloadsSnap.val()

            getPrev30Data(downloads);
            getTotalDownloads(downloads);

            const todayDownloads = Object.keys(downloads[new Date().toLocaleDateString().replaceAll('/', '-')]).length
            if (todayDownloads === undefined) return;
            setTodayDownloads(todayDownloads)
            const yesterdayDate = new Date(Date.now() - 86400000).toLocaleDateString().replaceAll('/', '-')
            const yesterdayDownloads = Object.keys(downloads[yesterdayDate]).length

            setPercentChange((todayDownloads - yesterdayDownloads) / yesterdayDownloads * 100)



        })()
    }, [pack])

    function getTotalDownloads(downloads: any) {
        let total = 0;
        Object.keys(downloads).forEach(key => {
            total += Object.keys(downloads[key]).length;
        });
        setTotalDownloads(total);
    }

    function getPrev30Data(downloads: any) {
        let date = new Date(Date.now());
        console.log(date.toLocaleDateString())
        date.setDate(date.getDate() - 30);
        console.log(date.toLocaleDateString())
        const downloadDates = Object.keys(downloads).filter(key => { let result = new Date(key) > date; console.log(key, result); return result; });
        console.log(downloadDates.sort((a,b) => {return (new Date(a)) > (new Date(b)) ? 1 : -1}))
        const data = downloadDates.map(key => {
            return {
                date: key,
                Downloads: Object.keys(downloads[key]).length
            };
        });
        console.log(data);
        setPrev30Data(data);
    }

    function Prev30Days() {
        return <div className='flex flex-col'>
            <h3>Previous 30 Days Downloads</h3>
            <LineChart width={400} height={300} data={prev30Data}>
                <XAxis dataKey="date" style={{fontFamily:'Inconsolata'}} />
                <YAxis style={{fontFamily:'Inconsolata'}} />
                <Tooltip contentStyle={{ fontFamily: "Inconsolata", border: '2px solid var(--lightAccent)', color: 'var(--text)', borderRadius: 8, backgroundColor:'var(--lightBackground)' }} />
                <CartesianGrid stroke="var(--text)" strokeOpacity={0.2} />
                <Line type="monotone" dataKey="Downloads" stroke="var(--darkAccent)" yAxisId={0} />
            </LineChart>
        </div>
    }

    const up = percentChange >= 0
    return <div className='flex flex-col p-2 gap-4'>
        <label className='text-center'>Total Downloads: <label className='bg-darkBackground rounded-md p-2'>{totalDownloads}</label></label>
        <label className='text-center'>
            <label>Today's Downloads: </label>
            <label className='bg-darkBackground rounded-md p-2'>{todayDownloads}{' '}
                (<label className={`text-${up ? 'green-400' : 'badAccent'}`} title={`${up ? 'Up' : 'Down'} ${Math.abs(percentChange).toPrecision(3)}% from yesterday`}>{Math.abs(percentChange).toPrecision(3)}% {up ? '⬆' : '⬇'}</label>)
            </label>
        </label>
        {prev30Data !== undefined && <Prev30Days />}
    </div>
}