import React, { useState } from 'react';
import { Stack, PrimaryButton, Pivot, PivotItem, DefaultButton } from '@fluentui/react';
import * as copy from 'copy-to-clipboard';
import JSONTree from 'react-json-tree';
import { Trial } from '@model/trial';
import { MANAGER_IP, RETIARIIPARAMETERS } from '@static/const';
import { EXPERIMENT, TRIALS } from '@static/datamodel';
import { reformatRetiariiParameter } from '@static/function';
import PaiTrialLog from './PaiTrialLog';
import TrialLog from './TrialLog';
import MessageInfo from '../MessageInfo';
import PanelMonacoEditor from '../PanelMonacoEditor';
import '@style/experiment/overview/overview.scss';

/**
 *  netron URL must be synchronized with ts/nni_manager/rest_server/index.ts`.
 *  Remember to update it if the value is changed or this file is moved.
 **/

interface OpenRowProps {
    trialId: string;
}

const OpenRow = (props: OpenRowProps): any => {
    const [typeInfo, setTypeInfo] = useState('');
    const [info, setInfo] = useState('');
    const [isHidenInfo, setHideninfo] = useState(true);
    const [showRetiaParamPanel, setShowRetiaparamPanel] = useState(false);
    const trialId = props.trialId;
    const trial = TRIALS.getTrial(trialId);
    const logPathRow = trial.info.logPath || "This trial's log path is not available.";
    const originParameters = trial.parameter;
    const hasVisualHyperParams = RETIARIIPARAMETERS in originParameters;

    const hideMessageInfo = (): void => {
        setHideninfo(true);
    };

    const hideRetiaParam = (): void => {
        setShowRetiaparamPanel(false);
    };

    const isshowRetiaParamPanel = (): void => {
        setShowRetiaparamPanel(true);
    };

    /**
     * info: message content
     * typeInfo: message type: success | error...
     * continuousTime: show time, 2000ms
     */
    const getCopyStatus = (info: string, typeInfo: string): void => {
        setTypeInfo(typeInfo);
        setInfo(info);
        setHideninfo(false);
        setTimeout(hideMessageInfo, 2000);
    };

    const copyParams = (trial: Trial): void => {
        // get copy parameters
        const params = JSON.stringify(reformatRetiariiParameter(trial.parameter as any), null, 4);
        if (copy.default(params)) {
            getCopyStatus('Successfully copy parameters to clipboard in form of python dict !', 'success');
        } else {
            getCopyStatus('Failed !', 'error');
        }
    };

    const openTrialLog = (filename: string): void => {
        window.open(`${MANAGER_IP}/trial-file/${props.trialId}/${filename}`);
    };

    const openModelOnnx = (): void => {
        // TODO: netron might need prefix.
        window.open(`/netron/index.html?url=${MANAGER_IP}/trial-file/${props.trialId}/model.onnx`);
    };

    const openTrialWandb = (): void => {
        window.open(
            `${EXPERIMENT.wandbLink}/runs/${trial.info.sequenceId.toString().padStart(3, '0')}-${props.trialId}${
                EXPERIMENT.wandbQueries
            }`
        );
    };

    return (
        <Stack className='openRow'>
            <Stack className='openRowContent'>
                <Pivot>
                    <PivotItem headerText='Parameters' key='1' itemIcon='TestParameter'>
                        {trial.info.hyperParameters !== undefined ? (
                            <Stack className='description'>
                                <Stack className='bgHyper'>
                                    <JSONTree
                                        hideRoot={true}
                                        shouldExpandNode={() => true} // default expandNode
                                        getItemString={() => null} // remove the {} items
                                        data={reformatRetiariiParameter(originParameters as any)}
                                    />
                                </Stack>
                                <Stack horizontal className='copy'>
                                    <PrimaryButton
                                        onClick={copyParams.bind(this, trial)}
                                        text='Copy as json'
                                        styles={{ root: { width: 128, marginRight: 10 } }}
                                    />
                                    {hasVisualHyperParams && (
                                        <DefaultButton onClick={isshowRetiaParamPanel} text='Original parameters' />
                                    )}
                                    {/* copy success | failed message info */}
                                    {!isHidenInfo && <MessageInfo typeInfo={typeInfo} info={info} />}
                                    {showRetiaParamPanel && (
                                        <PanelMonacoEditor
                                            hideConfigPanel={hideRetiaParam}
                                            panelName='Retiarii parameters'
                                            panelContent={JSON.stringify(originParameters, null, 2)}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack className='logpath'>
                                <span className='logName'>Error: </span>
                                <span className='error'>{`This trial's parameters are not available.'`}</span>
                            </Stack>
                        )}
                    </PivotItem>
                    <PivotItem headerText='Log' key='2' itemIcon='M365InvoicingLogo'>
                        {
                            // FIXME: this should not be handled in web UI side
                            EXPERIMENT.trainingServicePlatform === 'local' ? (
                                <div>
                                    <TrialLog logStr={logPathRow} logName='LogPath:' />
                                    {/* view trial log */}
                                    <div className='copy' style={{ marginTop: 4 }}>
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'trial.log')}
                                            text='View trial log'
                                        />
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'stderr')}
                                            text='View trial error'
                                            styles={{ root: { marginLeft: 15 } }}
                                        />
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'stdout')}
                                            text='View trial stdout'
                                            styles={{ root: { marginLeft: 15 } }}
                                        />
                                    </div>
                                </div>
                            ) : EXPERIMENT.trainingServicePlatform === 'slurm' ? (
                                <div>
                                    <TrialLog logStr={logPathRow} logName='LogPath:' />
                                    {/* view trial log */}
                                    <div className='copy' style={{ marginTop: 4 }}>
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'trial.log')}
                                            text='View trial log'
                                        />
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'stderr')}
                                            text='View trial error'
                                            styles={{ root: { marginLeft: 15 } }}
                                        />
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'stdout')}
                                            text='View trial stdout'
                                            styles={{ root: { marginLeft: 15 } }}
                                        />
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'slurm_stderr')}
                                            text='View slurm error'
                                            styles={{ root: { marginLeft: 15 } }}
                                        />
                                        <PrimaryButton
                                            onClick={openTrialLog.bind(this, 'slurm_stdout')}
                                            text='View slurm stdout'
                                            styles={{ root: { marginLeft: 15 } }}
                                        />
                                        {EXPERIMENT.useWandb &&
                                        [
                                            'SUCCEEDED',
                                            'FAILED',
                                            'USER_CANCELED',
                                            'SYS_CANCELED',
                                            'EARLY_STOPPED'
                                        ].includes(trial.info.status) ? (
                                            <PrimaryButton
                                                onClick={openTrialWandb.bind(this)}
                                                text='View W&B Board'
                                                styles={{ root: { marginLeft: 15 } }}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <PaiTrialLog logStr={logPathRow} />
                            )
                        }
                    </PivotItem>
                    {EXPERIMENT.metadata.tag.includes('retiarii') ? (
                        <PivotItem headerText='Visualization' key='3' itemIcon='FlowChart'>
                            <div id='visualization'>
                                <div id='visualizationText'>Visualize models with 3rd-party tools.</div>
                                <PrimaryButton
                                    onClick={openModelOnnx.bind(this)}
                                    text='Netron'
                                    styles={{ root: { marginLeft: 15 } }}
                                />
                            </div>
                        </PivotItem>
                    ) : null}
                </Pivot>
            </Stack>
        </Stack>
    );
};

export default OpenRow;
