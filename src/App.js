import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQueryParamState } from './utils'; // Adjust the path as necessary

const SECOND_PER_DAY = 86400;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

function Calculator() {
  const [dailyActiveUsers, setDailyActiveUsers] = useQueryParamState('dau', '');
  const [clicksPerDay, setClicksPerDay] = useQueryParamState('cpd', '');
  const [peakMultiplier, setPeakMultiplier] = useQueryParamState('pm', '');
  const [payloadSizeKb, setPayloadSizeKb] = useQueryParamState('psk', '');
  const [verbose, setVerbose] = useState(false);

  const [qps, setQps] = useState(0);
  const [mau, setMau] = useState(0);
  const [peakQps, setPeakQps] = useState(0);
  const [bandwidthPerSec, setBandwidthPerSec] = useState(0);
  const [peakBandwidthPerSec, setPeakBandwidthPerSec] = useState(0);
  const [storagePerYear, setStoragePerYear] = useState(0);
  const [storageForTenYears, setStorageForTenYears] = useState(0);

  useEffect(() => {
    const numDailyActiveUsers = Number(dailyActiveUsers);
    const numClicksPerDay = Number(clicksPerDay);
    const numPeakMultiplier = Number(peakMultiplier);
    const numPayloadSizeKb = Number(payloadSizeKb);

    const calculatedQps = numClicksPerDay * numDailyActiveUsers / SECOND_PER_DAY;
    const calculatedMau = numDailyActiveUsers * DAYS_PER_MONTH;
    const calculatedPeakQps = calculatedQps * numPeakMultiplier;
    const bandwidthPerSec_calculated = numPayloadSizeKb * calculatedQps / 1024;
    const peakBandwidthPerSec_calculated = bandwidthPerSec_calculated * peakMultiplier; 
    const storagePerYear_calculated = bandwidthPerSec_calculated * SECOND_PER_DAY * DAYS_PER_YEAR / 1024;
    const storageForTenYears_calculated = storagePerYear_calculated * 10;

    setQps(calculatedQps);
    setMau(calculatedMau);
    setPeakQps(calculatedPeakQps);
    setBandwidthPerSec(bandwidthPerSec_calculated);
    setStoragePerYear(storagePerYear_calculated);
    setStorageForTenYears(storageForTenYears_calculated);
    setPeakBandwidthPerSec(peakBandwidthPerSec_calculated);
  }, [dailyActiveUsers, clicksPerDay, peakMultiplier, payloadSizeKb]);

  const handleNumericChange = (value, setter) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const toggleVerbose = () => setVerbose(!verbose);

  const createSharableLink = () => {
    const params = new URLSearchParams({
      dau: dailyActiveUsers,
      cpd: clicksPerDay,
      pm: peakMultiplier,
      psk: payloadSizeKb,
    }).toString();
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    navigator.clipboard.writeText(url).then(() => {
      // Display a toast notification instead of an alert
      toast.info('URL copied to clipboard!', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        });
    });
  };


  return (
    <div>
      <h2>System Design Calculator</h2>
      <div>DAU</div>
      <input
        type="text"
        value={dailyActiveUsers}
        onChange={(e) => handleNumericChange(e.target.value, setDailyActiveUsers)}
        placeholder="Daily Active Users"
      />
      <div>Clicks Per Day</div>
      <input
        type="text"
        value={clicksPerDay}
        onChange={(e) => handleNumericChange(e.target.value, setClicksPerDay)}
        placeholder="Clicks Per Day"
      />
      <div>Peak Multiplier</div>
      <input
        type="text"
        value={peakMultiplier}
        onChange={(e) => handleNumericChange(e.target.value, setPeakMultiplier)}
        placeholder="Peak Multiplier"
      />
      <div>Payload Size (KB)</div>
      <input
        type="text"
        value={payloadSizeKb}
        onChange={(e) => handleNumericChange(e.target.value, setPayloadSizeKb)}
        placeholder="Payload Size"
      />
      <button onClick={toggleVerbose}>{verbose ? 'Hide Details' : 'Show Details'}</button>
      
      {/* Display logic with calculations */}
      <div>QPS: {verbose ? `${clicksPerDay} * ${dailyActiveUsers} / ${SECOND_PER_DAY} = ${qps.toFixed(2)}` : qps.toFixed(2)}</div>
      <div>MAU: {verbose ? `${dailyActiveUsers} * ${DAYS_PER_MONTH} = ${mau}` : mau}</div>
      <div>Peak QPS: {verbose ? `${qps.toFixed(2)} * ${peakMultiplier} = ${peakQps.toFixed(2)}` : peakQps.toFixed(2)}</div>
      <div>Bandwidth per second (MB): {verbose ? `${payloadSizeKb} * ${qps.toFixed(2)} / 1024 = ${bandwidthPerSec.toFixed(5)}` : bandwidthPerSec.toFixed(5)}</div>
      <div>Peak Bandwidth per second (MB): {verbose ? `${payloadSizeKb} * ${peakQps.toFixed(2)} / 1024 = ${peakBandwidthPerSec.toFixed(5)}` : peakBandwidthPerSec.toFixed(5)}</div>
      <div>Storage required for one year (GB): {verbose ? `${bandwidthPerSec.toFixed(5)} * ${SECOND_PER_DAY} * ${DAYS_PER_YEAR} / 1024 = ${storagePerYear.toFixed(1)}` : storagePerYear.toFixed(1)}</div>
      <div>Storage required for ten years (GB): {verbose ? `${storagePerYear.toFixed(1)} * 10 = ${storageForTenYears.toFixed(1)}` : storageForTenYears.toFixed(1)}</div>
      <button onClick={createSharableLink}>Copy Sharable URL</button>
    </div>
  );
}

export default Calculator;
