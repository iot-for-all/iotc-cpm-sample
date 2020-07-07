import CSS from 'csstype';
declare var React: any;
declare var ReactDOM: any;

type ReactDispatch<T> = React.Dispatch<React.SetStateAction<T>>;

function Credentials() {
    const [formState, setFormState] = React.useState({})
    const [existing, setExisting] = React.useState(true);
    const [authType, setAuthType] = React.useState(null);
    const [valid, setValid] = React.useState(false);

    const onChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        setAuthType(e.currentTarget.value);
    };

    const onItemChange = function (id: string, val: string) {
        setFormState((current: any) => ({ ...current, [id]: val }));
    }

    React.useEffect(() => {
        if (formState['device-id'] && formState['scope-id'] && formState['encryption-key'] && (formState['device-key'] || formState['group-key'])) {
            setValid(true);
        }
    }, [formState])

    return (<div style={style.container}>
        <div style={style.box}>
            <Title>CPM Credentials Generator</Title>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <div>
                    <FormItem id='device-id' label='Device Id' helpText='The device unique Id' onChange={onItemChange.bind(null, 'device-id')} />
                    <FormItem id='scope-id' label='Scope Id' helpText='Application scope Id' onChange={onItemChange.bind(null, 'scope-id')} />
                    <FormItem id='encryption-key' label='Encryption Key' helpText='Encryption Key for generated credentials. This is the same value of user login password used inside the mobile application.' onChange={onItemChange.bind(null, 'encryption-key')} />

                    {/* <FormItem id='device-id' label='Device Id' /> */}
                    <DeviceCredentials setExisting={setExisting} />
                    {existing && <FormItem id='device-key' label='Device Key' helpText='Connection key for the device' onChange={onItemChange.bind(null, 'device-key')} />}
                    {!existing && <>
                        <FormItem id='group-key' label='Group Key' helpText='Connection key for the application' onChange={onItemChange.bind(null, 'group-key')} />
                        <ModelDetails onChange={onItemChange.bind(null, 'model-id')} /></>}
                </div>
                <div>
                    <input type='radio' name='cred-type' value={'qr'} onChange={onChange} />QR Code
                    <input type='radio' name='cred-type' value={'numeric'} onChange={onChange} />Numeric Code
                    <div style={{ width: '300px', height: '300px', border: '1px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {authType === null && <p>Please select authorization type</p>}
                        {authType !== null && <button disabled={!valid}>Generate</button>}
                    </div>

                </div>
            </div>
        </div>
    </div >)
}


function DeviceCredentials(props: { setExisting: ReactDispatch<boolean> }) {
    const [selected, setSelected] = React.useState('existing');

    const onChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        setSelected(e.currentTarget.value);
        props.setExisting(e.currentTarget.value === 'existing');
    };
    return (
        <div id='device-group'>
            <p>Would you like to create a new device or use an existing one?</p>
            <input type='radio' name='device-group' value={'existing'} checked={selected === 'existing'} onChange={onChange} />Existing
            <input type='radio' name='device-group' value={'new'} checked={selected === 'new'} onChange={onChange} />New
        </div>
    )
}


function ModelDetails(props: { onChange: (value: any) => void }) {
    const { onChange: onModelChange } = props;
    const [selected, setSelected] = React.useState('knee');
    const [defaultValue, setDefaultValue] = React.useState(undefined);

    const onChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        setSelected(e.currentTarget.value);
    };
    const getValue = function () {
        switch (selected) {
            case 'knee':
                return 'urn:continuousPatientMonitoringTemplate:Smart_Knee_Brace_5k3:1';
            case 'vitals':
                return 'urn:continuousPatientMonitoringTemplate:Smart_Vitals_Patch_220:1';
            default:
                return undefined;
        }
    };

    React.useEffect(() => {
        debugger
        setDefaultValue(getValue());
    }, [selected])

    return (
        <div id='model-group'>
            <p>Assign to device template</p>
            <input type='radio' name='model-group' value={'knee'} checked={selected === 'knee'} onChange={onChange} />Smart Knee Brace
            <input type='radio' name='model-group' value={'vitals'} checked={selected === 'vitals'} onChange={onChange} />Smart Vitals Patch
            <input type='radio' name='model-group' value={'custom'} checked={selected === 'custom'} onChange={onChange} />Custom
            <FormItem id='model-id' value={defaultValue} label='Model Id' helpText='Id of the model to which assign device to.' onChange={onModelChange.bind(null, 'model-id')} />
        </div>
    )
}

function Title(props: { children: string }) {
    return (<h1 style={style.title}>{props.children}</h1>)
}

function Help(props: { text: string, position: DOMRect }) {
    return (<div style={{ ...style.help, top: props.position.top - 50, left: props.position.left + 50 }}>
        <p>{props.text}</p>
    </div>)
}


function FormItem(props: { id: string, value?: string, label: string, helpText: string, onChange: (value: any) => void }) {
    const { id, label, onChange } = props;
    const [value, setValue] = React.useState('');
    const [showHelp, setShowHelp] = React.useState(false);
    const [position, setPosition] = React.useState(null);

    const onClickBody = function (e: any) {
        if (e.target) {
            if (e.target.closest(`#${id}-div`)) {
                return;
            }
        }
        setShowHelp(false);
    }

    React.useEffect(() => {
        document.addEventListener('click', onClickBody)
        return () => {
            document.removeEventListener('click', onClickBody);
        }
    }, []);

    return (<div id={`${id}-div`}>
        <p style={style.label}>{label}<i style={{ marginLeft: 10, cursor: 'pointer' }} className="material-icons md-18" onClick={(e) => {
            setPosition(e.currentTarget.getBoundingClientRect());
            setShowHelp((current: boolean) => (!current));
        }}>help_outline</i></p>
        {showHelp && <Help text={props.helpText} position={position} />}
        <input style={style.input} id={id} value={props.value ? props.value : value} readOnly={!!props.value} onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
        }
        } />
    </div>)
}



const style: { [styleId: string]: any } = {
    container: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url("../assets/background.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    },
    box: {
        display: 'flex',
        width: '50%',
        backgroundColor: 'white',
        boxShadow: '3px 3px 3px ##9E9E9E',
        borderRadius: '10px',
        flexDirection: 'column',
        padding: '40px'
    },
    title: {
        fontFamily: 'Poppins-Bold',
        alignSelf: 'center'
    },
    label: {
        marginLeft: '5px',
        marginBottom: '5px'
    },
    input: {
        width: '300px',
        paddingTop: '20px',
        border: 'none',
        borderBottom: '1px solid #9E9E9E',
        marginBottom: '20px',
    },
    help: {
        position: 'absolute',
        textAlign: 'center',
        width: '200px',
        border: '1px solid gray',
        backgroundColor: 'white',
        padding: '20px'
    }
}


const domContainer = document.querySelector('#root');
ReactDOM.render(React.createElement(Credentials), domContainer);
