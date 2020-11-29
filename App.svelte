<script>
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
import IconTextField from '@smui/textfield/icon/index';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text'

import Radio from '@smui/radio';
import FormField from '@smui/form-field';
import Select, {
    Option
} from '@smui/select';
import Slider from '@smui/slider'
import Textarea from '@smui/textfield/Textarea.svelte';
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

let shareResults = function() {

    window.location = `https://airtable.com/shrFjIMkvj7dC549W?prefill_Action=${action}&prefill_Process=${process}&prefill_People=${people}&prefill_Ideas=${ideas}`
    shared_results = true;
}
let BASE_FUNCTIONS_URL = "/.netlify/functions/"
// let BASE_FUNCTIONS_URL = "http://localhost:9000/"
let emailResults = function(request_id) {
  return new Promise(function(resolve, reject){
    if (email_address.invalid == false && email_address.dirty == true && email_address.value != "") {
        var options = {
            "method": "POST",
            "port": null,
            "path": `${BASE_FUNCTIONS_URL}email`,
            "headers": {
                "content-type": "application/json"
            }
        };

        var req = http.request(options, function(res) {
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
            });

            res.on("end", function() {
                var body = Buffer.concat(chunks);
                email_address = {
                    value: "",
                    dirty: false,
                    invalid: true,
                    message: `Sent to ${email_address.value}`
                }
                resolve(`Sent to ${email_address.value}`)
            });
        });

        req.write(JSON.stringify({
            "to": email_address.value,
            "id": request_id
        }));
        req.end();
    }else{
      reject("Email not valid")
    }
  })
}
let createProfile = function() {
    var options = {
        "method": "POST",
        "port": null,
            "path": `${BASE_FUNCTIONS_URL}users`,
        "headers": {
            "content-type": "application/json"
        }
    };

    var req = http.request(options, function(res) {
        if (res.statusCode == 200) {
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
            });

            res.on("end", function() {
                var body = JSON.parse(Buffer.concat(chunks));

                id = body._id
                state = stateEnum.TAKE_TEST
            });

        }
    });

    req.write(JSON.stringify(info));
    req.end();
}

let getProfile = async function(id) {
    return new Promise(function(resolve, reject) {
        var options = {
            "method": "GET",
            "port": null,
            "path": `${BASE_FUNCTIONS_URL}users?id=${id}`,
            "headers": {
                "content-type": "application/json"
            }
        };

        var req = http.request(options, function(res) {
            if (res.statusCode == 200) {
                var chunks = [];

                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function() {
                    var body = JSON.parse(Buffer.concat(chunks));
                    resolve(body)
                });

            }
        });

        req.write(JSON.stringify(info));
        req.end();
    })
}

let postResult = async function() {
    return new Promise(function(resolve, reject) {
        var options = {
            "method": "POST",
            "port": null,
            "path": `${BASE_FUNCTIONS_URL}results`,
            "headers": {
                "content-type": "application/json"
            }
        };

        var req = http.request(options, function(res) {
            if (res.statusCode == 200) {
                var chunks = [];

                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function() {
                    var body = JSON.parse(Buffer.concat(chunks));
                    resolve(body)
                });

            }
        });

        req.write(JSON.stringify({
          action: action,
          process: process,
          people: people,
          ideas: ideas,
          user_id: id
        }));
        req.end();
    })
}

let begin = false;
const urlParams = new URLSearchParams(window.location.search);
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
let page = 39;
let questions = [{
        "A": "I like action",
        "B": "I deal with problems in a systematic way"
    },
    {
        "A": "I enjoy change very much",
        "B": "I believe that teams are more effective than individuals"
    },
    {
        "A": "I enjoy working with people",
        "B": "I am more interested in the future than the past"
    },
    {
        "A": "Deadlines are important for me",
        "B": "I like to attend well organized group meetings"
    },
    {
        "A": "I cannot stand procrastination",
        "B": "I believe that new ideas have to be tested before being used"
    },
    {
        "A": "I am always looking for new possibilities",
        "B": "I enjoy the stimulation of interaction with others"
    },
    {
        "A": "I want to set up my own objectives",
        "B": "When I start something I like to go through until the end"
    },
    {
        "A": "I do challenge people around me",
        "B": "I basically try to understand other people's emotions"
    },
    {
        "A": "I look forward to receiving feedback on my performance",
        "B": "I find the step-by-step approach very effective"
    },
    {
        "A": "I think I am good at reading people",
        "B": "I like creative problem solving"
    },
    {
        "A": "I think about the future all the time",
        "B": "I am sensitive to others' needs"
    },
    {
        "A": "Planning is the key to success",
        "B": "I become impatient with long deliberations"
    },
    {
        "A": "I am cool under pressure",
        "B": "I value experience very much"
    },
    {
        "A": "I listen to people",
        "B": "People say that I am a fast thinker"
    },
    {
        "A": "Cooperation is a key word for me",
        "B": "I use logical methods to test alternatives"
    },
    {
        "A": "I always question myself",
        "B": "I like to handle several projects at the same time"
    },
    {
        "A": "I learn by doing",
        "B": "I believe that my head rules my heart"
    },
    {
        "A": "I do not like details",
        "B": "I can predict how others may react to a certain action"
    },
    {
        "A": "Thought and analysis should always precede action",
        "B": "I am able to assess the climate of a group"
    },
    {
        "A": "I perceive myself as decisive",
        "B": "I have a tendency to start things and not finish them"
    },
    {
        "A": "I search for challenging tasks",
        "B": "I rely on observation and data"
    },
    {
        "A": "I can express my feelings openly",
        "B": "I like to design new projects"
    },
    {
        "A": "I enjoy reading very much",
        "B": "I perceive myself as a helper"
    },
    {
        "A": "I like to focus on one issue at a time",
        "B": "I like to achieve"
    },
    {
        "A": "I enjoy learning about others",
        "B": "I like variety"
    },
    {
        "A": "Facts speak for themselves",
        "B": "I use my imagination as much as possible"
    },
    {
        "A": "I am impatient with long, slow assignments",
        "B": "My mind never stops working"
    },
    {
        "A": "Key decisions have to be made in a cautious way",
        "B": "I strongly believe that people need each other to get work done"
    },
    {
        "A": "I usually make decisions without thinking too much",
        "B": "Emotions create problems"
    },
    {
        "A": "I like to be liked by others",
        "B": "I can put two and two together very quickly"
    },
    {
        "A": "I try out my new ideas on people",
        "B": "I believe in the scientific approach"
    },
    {
        "A": "I like to get things done",
        "B": "Good relationships are essential"
    },
    {
        "A": "I am impulsive",
        "B": "I accept differences in people"
    },
    {
        "A": "I like to be intellectually stimulated",
        "B": "Communicating with people is an end in itself"
    },
    {
        "A": "I like to organize",
        "B": "I usually jump from one task to another"
    },
    {
        "A": "Self-fulfilment is a key word for me",
        "B": "Talking and working with people is a creative act"
    },
    {
        "A": "I enjoy playing with ideas",
        "B": "I dislike to waste my time"
    },
    {
        "A": "I enjoy doing what I am good at",
        "B": "I learn by interacting with others"
    },
    {
        "A": "I am patient with details",
        "B": "I find abstractions interesting and enjoyable"
    },
    {
        "A": "I like brief, to-the-point statements",
        "B": "I feel confident in myself"
    }
]
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
    <title>Communication Styles Inventory</title>
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
                          <Cell numeric>{result.action}</Cell>
                          <Cell numeric>{result.people}</Cell>
                          <Cell numeric>{result.process}</Cell>
                          <Cell numeric>{result.ideas}</Cell>
                          <Cell>
                            <IconButton class="material-icons" on:click={() => {
                              email_address.for_id = result._id
                              emailDialog.open()
                            }} title="Send Email">send</IconButton>
                          </Cell>
                      </Row>
                      {/each}
                  </Body>
              </DataTable>
                <Button on:click={()=> {
                    state = stateEnum.TAKE_TEST
                    }}>
                    <Label>Retake Survey</Label>
                </Button>
        </Content>
    </Card>
    {/if}
    {#if state == stateEnum.ANON_USER}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            <h1>Welcome to the Communications Styles Inventory Discovery Application</h1>
            <p>This app is designed to help you discover your preferred communication style. A report will appear at the end of the questionnaire with a copy sent to the email address that you provide. This app will not store your email address after the session is concluded. </p>
            <p>You will be asked some demographic questions but this information will not be tied to either your name or your email address. In the email, you will be given a unique identifying link
that will allow you to review your past results.</p>

            <Button on:click={()=> {
                state = stateEnum.CREATE_PROFILE
                }}>
                <Label>Begin new session</Label>
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
                        <Label>Cancel</Label>
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
                        <Label>Login</Label>
                    </Button>
                </Actions>
            </Dialog>

        </Content>
    </Card>
    {/if}
    {#if state == stateEnum.CREATE_PROFILE}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            <center><h1>Demographic Information (will be stored anonymously)</h1></center>
            <div class="row">
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.country} bind:value={info.country} label="Country*" menu>
                        <Option value=""></Option>
                        {#each Object.keys(countries) as country}
                        <Option value={countries[country].name} selected={info.country === country}>{countries[country].emoji}&nbsp;&nbsp;{countries[country].native}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.language} bind:value={info.language} label="Language" menu>
                        <Option value=""></Option>
                        {#each Object.keys(languagesAll).sort((a, b) => languagesAll[a].name < languagesAll[b].name) as language}
                        <Option value={languagesAll[language].name} selected={info.language === language}>{languagesAll[language].name} ({languagesAll[language].native})</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.birth_year} bind:value={info.birth_year} label="Birth Year" menu>
                        <Option value=""></Option>
                        {#each [...Array(100).keys()].map(i=> new Date().getFullYear()-i) as year}
                        <Option value={parseInt(year)} selected={info.birth_year === year}>{year}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.education} bind:value={info.education} label="Education" menu>
                        <Option value=""></Option>
                        {#each ["High School degree", "University degree", "Graduate degree", "Doctorate degree"] as level}
                        <Option value={level} selected={info.education === level}>{level}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-md-3 col-xs-12">
                 <Textfield bind:invalid={infoInvalid.profession}  bind:value={info.profession} label="Profession" style="min-width:200px"></Textfield>
                </div>
                <div class="col-md-3 col-xs-12">
                    <Select enhanced bind:invalid={infoInvalid.gender} bind:value={info.gender} label="Gender" menu>
                        <Option value=""></Option>
                        {#each ["Male", "Female"] as gender}
                        <Option value={gender} selected={info.gender === gender}>{gender}</Option>
                        {/each}
                    </Select>
                </div>
                <div class="col-xs-12">
                    <small style="align: left;">* Country that best describes your cultural identity</small>
                    <br>
                    <center>
                        <FormField  bind:invalid={infoInvalid.eula} style="margin-right: 1em;">
                            <Checkbox bind:checked={info.eula} required />
                            <span slot="label" style={(infoInvalid.eula)?"color: #b00020;":""}>I agree to sharing this information and understand that it will be stored anonymously.</span>
                        </FormField>
                    </center>
                </div>
                <Button on:click={()=> {
                    id=""
                    info = {
                    }
                    state = stateEnum.ANON_USER
                    }}>
                    <Label>Back</Label>
                </Button>
                <Button on:click={()=> {
                    if(Object.values(info).reduce((invalid, result) => !!invalid && result, true)){
                    createProfile()
                    }else{
                    infoCheck = true
                    }
                    }}>
                    <Label>Start</Label>
                </Button>
            </div>

        </Content>
    </Card>
    {/if}

    {#if state == stateEnum.TAKE_TEST}
    {#if !begin}
    <Card style="width: 80%; margin-left: 10%;">
        <Content class="mdc-typography--body2" style="display">
            <p><center><strong>Communication Style Inventory</strong></center> </p>
            <p><left>You will be presented with 40 pairs of statements.  In each pair, select the statement that is most true of you.  Sometimes both statements will be true.  Sometimes neither will be exactly descriptive of you.  Pick the statement that is most true. Your score and communication style preference will appear at the end of the questionnaire. Thank you for your participation.</left> </p>

            <center>
                <Button on:click={()=> begin = true}>
                    <Label>Begin</Label>
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
                                                                                <text transform="matrix(1,0,0,1,44.5,70.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">Action: {action}</text>
                                                                            </g>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                <text transform="matrix(1,0,0,1,187.5,70.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">Process: {process}</text>
                                                                            </g>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                <text transform="matrix(1,0,0,1,49,251.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">Ideas: {ideas}</text>
                                                                            </g>
                                                                            <g style="mix-blend-mode:normal;" opacity="0.32">
                                                                                <text transform="matrix(1,0,0,1,192,251.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">People: {people}</text>
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
                                                                                                                <p>To receive your results by email, type your email address below and click the arrow beside the address.</p>
                                                                                                                <Textfield tabindex="0" type="email" withTrailingIcon={email_address.value !== ''} bind:dirty={email_address.dirty} bind:invalid={email_address.invalid} updateInvalid bind:value={email_address.value} label="Email Address" style="min-width: 250px;">
                                                                                                                    {#if email_address.value != ""}
                                                                                                                    <IconTextField tabindex="1" class="material-icons" role="button" on:  on:click={()=> emailResults(info.results[info.results.length-1]._id)}>send</IconTextField>
                                                                                                                    {/if}
                                                                                                                </Textfield>
                                                                                                                {#if !email_address.dirty && email_address.message != ""}
                                                                                                                <p>{email_address.message}</p>
                                                                                                                {/if}
                                                                                                                <HelperText validationMsg>That's not a valid email address.</HelperText>
                                                                                                            </div>
                                                                                                            </center>
                                                                                                            {/if}
                                                                                                            </div>
                                                                                                            </Content>
                                                                                                            <Actions>
                                                                                                                <ActionButtons>
                                                                                                                    <IconButton class="material-icons" disabled={page<=0 || page >= 40} on:click={() => page -= 1} title="Share">chevron_left</IconButton>
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
                                                                                                                    }} title="Share">chevron_right</IconButton>
                                                                                                                </ActionIcons>
                                                                                                            </Actions>
                                                                                                            </Card>
                                                                                                            {/if}
                                                                                                            {/if}
