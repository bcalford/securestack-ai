const areas = ['Application security','Secrets','Dependencies','API security','Cloud/IaC','Docker/container security','AI-generated explanation'];
export default function FocusAreaSelector() { return <fieldset><legend>Focus areas</legend>{areas.map(area=><label key={area}><input type="checkbox" name="focusAreas" value={area} defaultChecked/> {area}</label>)}</fieldset>; }
