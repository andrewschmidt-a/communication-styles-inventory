<script>
/*************************
 * Localization Code 
 ************************/

import { dictionary, locale, _, init} from 'svelte-i18n';

const localeList = require('./locales/index.js')


const urlParams = new URLSearchParams(window.location.search);
const language = (Object.keys(localeList).includes(language))?urlParams.get('lng'): undefined;
console.log(language);
init({
    fallbackLocale: 'en',
    initialLocale: 'en',
})
if(language){
    locale.set(language);
}
let localeChoice = language
$: if(localeChoice != language) {window.location.replace("?lng="+localeChoice);}


// ...
dictionary.set(localeList);


import DataTable, {
    Head,
    Body,
    Row,
    Cell
} from '@smui/data-table';
import Checkbox from '@smui/checkbox';
import Card, {
    Content,
    PrimaryAction,
    Media,
    MediaContent,
    Actions,
    ActionButtons,
    ActionIcons
} from '@smui/card';
import Button, {
    Label
} from '@smui/button';
import IconButton, {
    Icon
} from '@smui/icon-button';
import IconTextField from '@smui/textfield/icon';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text'

import Radio from '@smui/radio';
import FormField from '@smui/form-field';
import Select, {
    Option
} from '@smui/select';
import Dialog, {
    Title,
    InitialFocus
} from '@smui/dialog';
import {
    v4 as uuidv4
} from 'uuid';
const {
    countries,
    languagesAll
} = require('countries-list');
const professions = require('professions')

const http = require('https')

const stateEnum = {
    ANON_USER: 'ANON_USER',
    CREATE_PROFILE: 'CREATE_PROFILE',
    TAKE_TEST: 'TAKE_TEST',
    VIEW_PROFILE: 'VIEW_PROFILE'
}

let info = {
    country: null,
    language: null,
    birth_year: null,
    profession: "",
    education: null,
    eula: null,
    gender: null,
    results: []
}
let state = null;

let loginIdentifierDialog;
let emailDialog;

let calculate_side = (c) => Math.sqrt(Math.pow(c, 2) / 2)

let email_address = {
    value: "",
    dirty: false,
    invalid: true,
    message: ""
};
let shared_results = false;

let locales = {
    en: "English",
    es: "Españole",
    fr: "Français"
}

let shareResults = function() {

    window.location = `https://airtable.com/shrFjIMkvj7dC549W?prefill_Action=${action}&prefill_Process=${process}&prefill_People=${people}&prefill_Ideas=${ideas}`
    shared_results = true;
}
let BASE_FUNCTIONS_URL = "/.netlify/functions/"
// let BASE_FUNCTIONS_URL = "http://localhost:9000/"
let emailResults = function(request_id) {
  return new Promise(function(resolve, reject){
    if (email_address.invalid == false && email_address.dirty == true && email_address.value != "") {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: email_address.value,
                id: request_id
            })
            };

            fetch(`${BASE_FUNCTIONS_URL}email`, options)
            .then(response => response.text())
            .then(data => {
                email_address = {
                value: '',
                dirty: false,
                invalid: true,
                message: `Sent to ${email_address.value}`
                };
                console.log(`Sent to ${email_address.value}`);
            })
            .catch(error => console.error(error));
    }else{
      reject("Email not valid")
    }
  })
}
let createProfile = function() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(info)
        };

        fetch(`${BASE_FUNCTIONS_URL}users`, options)
        .then(response => {
            if (response.status === 200) {
            return response.json();
            }
        })
        .then(data => {
            if (data) {
            id = data._id;
            state = stateEnum.TAKE_TEST;
            }
        })
        .catch(error => console.error(error));
}

let getProfile = async function(id) {
    return new Promise(function(resolve, reject) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
            };

            fetch(`${BASE_FUNCTIONS_URL}users?id=${id}`, options)
            .then(response => {
                if (response.status === 200) {
                return response.json();
                }
            })
            .then(data => {
                if (data) {
                resolve(data);
                }
            })
            .catch(error => console.error(error));
    })
}

let postResult = async function() {
    return new Promise(function(resolve, reject) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                process: process,
                people: people,
                ideas: ideas,
                user_id: id
            })
            };

            fetch(`${BASE_FUNCTIONS_URL}results`, options)
            .then(response => {
                if (response.status === 200) {
                return response.json();
                }
            })
            .then(data => {
                if (data) {
                resolve(data);
                }
            })
            .catch(error => console.error(error));
    })
}

let begin = false;
let id = urlParams.get('id') || "";
$: guidInValid = id != null && !id.match(/^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/)
if (id) {
    state = stateEnum.VIEW_PROFILE
    getProfile(id).then((profile) => info = profile)
} else {
    state = stateEnum.ANON_USER
}
let infoCheck = false
$: infoInvalid = Object.fromEntries(Object.keys(info).map(key => [key, !info[key] && infoCheck]))
let page = 0;
let questions = $_('questions');
let answers = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
]

let answer_key = [{
        "A": "Action",
        "B": "Process"
    }, // Q1 <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // Q2 <!--checked-->
    {
        "A": "People",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "People",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "Action"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "Action"
    }, // <!--checked-->
    {
        "A": "People",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "People",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "Action"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "People",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "Action"
    }, // <!--checked-->
    {
        "A": "People",
        "B": "Action"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "People",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "Process"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Process",
        "B": "Action"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "People"
    }, // <!--checked-->
    {
        "A": "Ideas",
        "B": "Action"
    }, // <!--Fixed-->
    {
        "A": "Process",
        "B": "People"
    }, // <!--Fixed-->
    {
        "A": "Process",
        "B": "Ideas"
    }, // <!--checked-->
    {
        "A": "Action",
        "B": "People"
    } // <!--checked-->
]

let selected = "a"
const max_per_cat = 20;
const max_r_cat = 212.132;
$: action = answers.filter(e => e == "Action").length;
$: action_r = action * (max_r_cat) / max_per_cat
$: action_x = Math.round(150 - calculate_side(action_r))
$: action_y = Math.round(150 - calculate_side(action_r))

$: ideas = answers.filter(e => e == "Ideas").length;
$: ideas_r = ideas * (max_r_cat) / max_per_cat
$: ideas_x = Math.round(150 - calculate_side(ideas_r))
$: ideas_y = Math.round(150 + calculate_side(ideas_r))

$: process = answers.filter(e => e == "Process").length;
$: process_r = process * (max_r_cat) / max_per_cat
$: process_x = Math.round(150 + calculate_side(process_r))
$: process_y = Math.round(150 - calculate_side(process_r))

$: people = answers.filter(e => e == "People").length;
$: people_r = people * (max_r_cat) / max_per_cat
$: people_x = Math.round(150 + calculate_side(people_r))
$: people_y = Math.round(150 + calculate_side(people_r))
</script>

<style>
p {
    margin: 1em auto;
}
</style>

<svelte:head>
    <title>{$_('app.title')}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css" type="text/css" >

    </svelte:head>

    <!-- <p>Action: {action}</p>
<Slider bind:value="{action}" min={0} max={12} step={1} />
<p>Ideas {ideas}</p>
<Slider bind:value="{ideas}" min={0} max={12} step={1} />
<p>Process {process} </p>
<Slider bind:value="{process}" min={0} max={12} step={1} />
<p>People {people}</p>
    <Slider bind:value="{people}" min={0} max={12} step={1} /> -->

    <br>
            <Dialog bind:this={emailDialog}>
                <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
                <Title id="simple-title-email">Email Results</Title>
                <Content >
                    <Textfield tabindex="0" type="email" withTrailingIcon={email_address.value !== ''} bind:dirty={email_address.dirty} bind:invalid={email_address.invalid} updateInvalid bind:value={email_address.value} label="Email Address" style="min-width: 250px;">
                    </Textfield>
                    {#if !email_address.dirty && email_address.message != ""}
                    <p>{email_address.message}</p>
                    {/if}
                    <HelperText validationMsg>That's not a valid email address.</HelperText>
                </Content>
                <Actions>
                    <Button on:click={() => emailDialog.close()}>
                        <Label>Cancel</Label>
                    </Button>
                    <Button on:click={() => emailResults(email_address.for_id).then(() => {emailDialog.close()})}>
                        <Label>Email Results</Label>
                    </Button>
                </Actions>
            </Dialog>
    {#if state == stateEnum.VIEW_PROFILE}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
              <DataTable style="width:100%" table>
                  <Head>
                      <Row>
                          <Cell>Date</Cell>
                          <Cell>Action</Cell>
                          <Cell>People</Cell>
                          <Cell>Process</Cell>
                          <Cell>Ideas</Cell>
                          <Cell></Cell>
                      </Row>
                  </Head>
                  <Body>
                      {#each info.results || [] as result}
                      <Row>
                          <Cell>{Intl.DateTimeFormat('en-CA', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric'
                            }).format(new Date(result.date))}</Cell>
                          <Cell style="text-align:left;" numeric>{result.action}</Cell>
                          <Cell style="text-align:left;" numeric>{result.people}</Cell>
                          <Cell style="text-align:left;" numeric>{result.process}</Cell>
                          <Cell style="text-align:left;" numeric>{result.ideas}</Cell>
                          <Cell  style="text-align:center;">
                            <IconButton class="material-icons" on:click={() => {
                              email_address.for_id = result._id
                              emailDialog.open()
                            }} title="{$_('labels.sendEmail')}">send</IconButton>
                          </Cell>
                      </Row>
                      {/each}
                  </Body>
              </DataTable>
                <Button on:click={()=> {
                    state = stateEnum.TAKE_TEST
                    }}>
                    <Label>{$_("labels.retake")}</Label>
                </Button>
        </Content>
    </Card>
    {/if}
    {#if state == stateEnum.ANON_USER}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            <h1>{$_('app.welcome')}</h1>
            <p>{$_('app.description')}</p>
            <p>{$_('app.demographics')}</p>

            <center>
                <div class="row">
                    <div class="col-md-5 col-xs-12"></div>
                    <div class="col-md-2 col-xs-12">
                        <Select enhanced bind:value={localeChoice} label="{$_('demographics.language')}*" menu>
                            {#each Object.keys(locales) as locale}
                            <Option value={locale} selected={localeChoice === locale}>{locales[locale]}</Option>
                            {/each}
                        </Select>
                    </div>
                </div>
            </center>
            <Button on:click={()=> {
                state = stateEnum.CREATE_PROFILE
                }}>
                <Label>{$_('labels.begin')}</Label>
            </Button>
            <!-- <Button on:click={()=> loginIdentifierDialog.open()}>
                <Label>Login with identifier</Label>
            </Button> -->

            <Dialog bind:this={loginIdentifierDialog} aria-labelledby="simple-title" aria-describedby="simple-content">
                <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
                <Title id="simple-title">Dialog Title</Title>
                <Content >
                    <Textfield tabindex="0" bind:invalid={guidInValid} bind:value={id} label="Identifier" style="min-width: 250px;">
                    </Textfield>
                </Content>
                <Actions>
                    <Button on:click={() => loginIdentifierDialog.close()}>
                        <Label>{$_('labels.cancel')}</Label>
                    </Button>
                    <Button on:click={() => {
                        if(!guidInValid){
                          
                          getProfile(id).then((profile) => {
                            info=profile
                            loginIdentifierDialog.close()
                            state = stateEnum.VIEW_PROFILE
                          })
                        }
                        return;
                        }}>
                        <Label>{$_('labels.login')}</Label>
                    </Button>
                </Actions>
            </Dialog>

        </Content>
    </Card>
    {/if}
    {#if state == stateEnum.CREATE_PROFILE}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            <center><h1>{$_('demographics.title')}</h1></center>
            <div class="row">
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.country} bind:value={info.country} label="{$_('demographics.country')}*" menu>
                        <Option value=""></Option>
                        {#each Object.keys(countries) as country}
                        <Option value={countries[country].name} selected={info.country === country}>{countries[country].emoji}&nbsp;&nbsp;{countries[country].native}</Option>
                        {/each}
                    </Select>
                    <br/>
                    <small style="align: left;">* {$_('demographics.countryExplain')}</small>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.language} bind:value={info.language} label="{$_('demographics.language')}" menu>
                        <Option value=""></Option>
                        {#each Object.keys(languagesAll).sort((a, b) => languagesAll[a].name < languagesAll[b].name) as language}
                        <Option value={languagesAll[language].name} selected={info.language === language}>{languagesAll[language].name} ({languagesAll[language].native})</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.birth_year} bind:value={info.birth_year} label="{$_('demographics.birthyear')}" menu>
                        <Option value=""></Option>
                        {#each [...Array(100).keys()].map(i=> new Date().getFullYear()-i) as year}
                        <Option value={parseInt(year)} selected={info.birth_year === year}>{year}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.education} bind:value={info.education} label="{$_('demographics.education.label')}" menu>
                        <Option value=""></Option>
                        {#each [{value: "High School degree", label: $_('demographics.education.highschool')}, {value: "University degree", label: $_('demographics.education.university')}, {value: "Graduate degree", label: $_('demographics.education.graduate')}, {value: "Doctorate degree", label: $_('demographics.education.doctorate')}] as level}
                        <Option value={level.value} selected={info.education === level.value}>{level.label}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                 <Textfield bind:invalid={infoInvalid.profession}  bind:value={info.profession} label="Profession" style="min-width:200px"></Textfield>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.gender} bind:value={info.gender} label="{$_('demographics.gender.label')}" menu>
                        <Option value=""></Option>
                        {#each [{value: "Male", label: $_('demographics.gender.male')}, {value: "Female", label: $_('demographics.gender.female')}, {value: "Other", label: $_('demographics.gender.other')}] as gender}
                        <Option value={gender.value} selected={info.gender === gender.value}>{gender.label}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-xs-12">
                    <center>
                        <FormField  bind:invalid={infoInvalid.eula} style="margin-right: 1em;">
                            <Checkbox bind:checked={info.eula} required />
                            <span slot="label" style={(infoInvalid.eula)?"color: #b00020;":""}>{$_('demographics.eula')}</span>
                        </FormField>
                    </center>
                </div>
                <Button on:click={()=> {
                    id=""
                    info = {
                    }
                    state = stateEnum.ANON_USER
                    }}>
                    <Label>{$_('labels.back')}</Label>
                </Button>
                <Button on:click={()=> {
                    if(Object.values(info).reduce((invalid, result) => !!invalid && result, true))
                    {
                        createProfile()
                    }
                    else
                    {
                        infoCheck = true
                    }
                    }}>
                    <Label>{$_('labels.start')}</Label>
                </Button>
            </div>

        </Content>
    </Card>
    {/if}

    {#if state == stateEnum.TAKE_TEST}
    {#if !begin}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            <p><center><strong>{$_('app.title')}</strong></center> </p>
            <p><left>{$_('app.instructions')}</left></p>

            <center>
                <Button on:click={()=> begin = true}>
                    <Label>{$_('labels.start')}</Label>
                </Button>
            </center>
            
        </Content>
    </Card>
    {/if}
    {#if begin}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            {#if page < 40}
            <p>{page+1}/40</p>
            {/if}
            <div>
                {#if page < 40}
                <FormField>
                    <Radio bind:group={answers[page]} bind:value={answer_key[page]["A"]} />
                    <span slot="label">{questions[page]["A"]}</span>
                </FormField>
                <br>
                <FormField>
                    <Radio bind:group={answers[page]} bind:value={answer_key[page]["B"]} />
                    <span slot="label">{questions[page]["B"]}</span>
                </FormField>
                {/if}
                {#if page == 40 }
                <center>
                    <svg xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 300 300" width="300pt" height="300pt">
                        <defs>
                            <clipPath id="_clipPath_rqatKbygh5QZF4AQWI1kvTrCXwUilDez">
                                <rect width="300" height="300"/>
                                    </clipPath>
                                    </defs>
                                    <g clip-path="url(#_clipPath_rqatKbygh5QZF4AQWI1kvTrCXwUilDez)">
                                        <g opacity="0.88">
                                            <rect x="0" y="0" width="300" height="300" transform="matrix(1,0,0,1,0,0)" fill="rgb(255,255,255)"/>
                                                </g>
                                                <g opacity="0.4">
                                                    <rect x="0" y="0" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(255,0,0)"/>
                                                        <rect x="150" y="0" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(0,255,0)"/>
                                                            <rect x="0" y="150" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(255,122,0)"/>
                                                                <rect x="150" y="150" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(0,0,255)"/>
                                                                    </g>
                                                                    <line x1="150" y1="0" x2="150" y2="300" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(0,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                                                                        <line x1="0" y1="150" x2="300" y2="150" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(0,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                    <text transform="matrix(1,0,0,1,75,70.777)" text-anchor="middle" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">
                                                                                        <tspan>{$_('categories.action')}</tspan>
                                                                                        <tspan x="0" y="20">{action}</tspan>
                                                                                    </text>
                                                                            </g>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                    <text transform="matrix(1,0,0,1,225,70.777)" text-anchor="middle" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">
                                                                                        <tspan>{$_('categories.process')}</tspan>
                                                                                        <tspan x="0" y="20">{process}</tspan>
                                                                                    </text>
                                                                            </g>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                    <text transform="matrix(1,0,0,1,75,231.777)" text-anchor="middle" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">
                                                                                        <tspan>{$_('categories.ideas')}</tspan>
                                                                                        <tspan x="0" y="20">{ideas}</tspan>
                                                                                    </text>
                                                                            </g>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                    <text transform="matrix(1,0,0,1,225,231.777)" text-anchor="middle" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">
                                                                                        <tspan>{$_('categories.people')}</tspan>
                                                                                        <tspan x="0" y="20">{people}</tspan>
                                                                                    </text>
                                                                            </g>
                                                                            <circle vector-effect="non-scaling-stroke" cx="{action_x}" cy="{action_y}" r="4" fill="rgb(255,0,0)"/>
                                                                                <circle vector-effect="non-scaling-stroke" cx="{ideas_x}" cy="{ideas_y}" r="4" fill="rgb(255,0,0)"/>
                                                                                    <circle vector-effect="non-scaling-stroke" cx="{process_x}" cy="{process_y}" r="4" fill="rgb(255,0,0)"/>
                                                                                        <circle vector-effect="non-scaling-stroke" cx="{people_x}" cy="{people_y}" r="4" fill="rgb(255,0,0)"/>
                                                                                            <line x1="{ideas_x}" y1="{ideas_y}" x2="{people_x}" y2="{people_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                                                                                                <line x1="{action_x}" y1="{action_y}" x2="{process_x}" y2="{process_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                                                                                                    <line x1="{ideas_x}" y1="{ideas_y}" x2="{action_x}" y2="{action_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                                                                                                        <line x1="{people_x}" y1="{people_y}" x2="{process_x}" y2="{process_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                                                                                                            </g>
                                                                                                            </svg>
                                                                                                            <br>
                                                                                                            <div class="margins">
                                                                                                                <p>{$_('app.emailResults')}</p>
                                                                                                                <Textfield tabindex="0" type="email" withTrailingIcon={email_address.value !== ''} bind:dirty={email_address.dirty} bind:invalid={email_address.invalid} updateInvalid bind:value={email_address.value} label="{$_('labels.email')}" style="min-width: 250px;">
                                                                                                                    {#if email_address.value != ""}
                                                                                                                    <IconTextField tabindex="1" class="material-icons" role="button" on:click={()=> emailResults(info.results[info.results.length-1]._id)}>send</IconTextField>
                                                                                                                    {/if}
                                                                                                                </Textfield>
                                                                                                                {#if !email_address.dirty && email_address.message != ""}
                                                                                                                <p>{email_address.message}</p>
                                                                                                                {/if}
                                                                                                                <HelperText validationMsg>{$_('messages.invalidEmail')}</HelperText>
                                                                                                            </div>
                                                                                                            </center>
                                                                                                            {/if}
                                                                                                            </div>
                                                                                                            </Content>
                                                                                                            <Actions>
                                                                                                                <ActionButtons>
                                                                                                                    <IconButton class="material-icons" disabled={page<=0 || page >= 40} on:click={() => page -= 1} title="{$_('labels.share')}">chevron_left</IconButton>
                                                                                                                </ActionButtons>
                                                                                                                <ActionIcons>
                                                                                                                    <IconButton class="material-icons" disabled={page>=40 || answers[page] == null} on:click={() => {
                                                                                                                      page +=1
                                                                                                                      if(page == 40){
                                                                                                                        postResult().then((result => {
                                                                                                                          info.results = info.results || []
                                                                                                                          info.results.push(result)
                                                                                                                        }))
                                                                                                                      }
                                                                                                                    }} title="{$_('labels.share')}">chevron_right</IconButton>
                                                                                                                </ActionIcons>
                                                                                                            </Actions>
                                                                                                            </Card>
                                                                                                            {/if}
                                                                                                            {/if}
