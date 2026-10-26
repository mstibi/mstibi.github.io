(function(root){
  'use strict';
  // Pure command parser for the desk terminal. Output is plain text (the UI renders it with textContent), links as raw hrefs the UI re-checks.
  const COMMANDS=['help','whoami','ls','cat <file>','open <project>','contact','cv','date','clear','exit'];
  const slug=project=>project.name.toLowerCase().trim().replace(/\s+/g,'-');
  const say=(...lines)=>({lines:lines.map(text=>typeof text==='string'?{text}:text)});
  function run(input,data,now=new Date()){
    const words=String(input).trim().split(/\s+/).filter(Boolean),[cmd='',...args]=words,arg=args.join(' ').toLowerCase();
    if(!cmd)return say();
    switch(cmd.toLowerCase()){
      case 'help':return say('Commands: '+COMMANDS.join(', '),'Tip: arrow up repeats the last command. Real devs also try ls -a.');
      case 'whoami':return say(`${data.name.toLowerCase()} · ${data.location}`,data.intro);
      case 'ls':
        if(!arg)return say('about.txt  goals.txt  projects/');
        // Hidden file is the trail to the sudo secret: help mentions ls -a, the file names the command.
        if(['-a','-la','-al'].includes(arg))return say('.  ..  .hire_me  about.txt  goals.txt  projects/');
        if(arg==='projects'||arg==='projects/')return say(data.projects.map(slug).join('  '));
        return say(`ls: cannot access '${arg}': No such file or directory`);
      case 'cat':
        if(arg==='about.txt')return say(data.about);
        if(arg==='.hire_me')return say('Note to recruiters: you have permission.','Run: sudo hire mateo');
        if(arg==='goals.txt')return say('ship cool stuff','land a junior / student developer role','keep learning how things work');
        return say(arg?`cat: ${arg}: No such file or directory`:'usage: cat <file>  (try ls)');
      case 'open':{
        if(!arg)return say('usage: open <project>  (try ls projects)');
        const matches=data.projects.filter(project=>slug(project).startsWith(arg.replace(/\s+/g,'-')));
        if(matches.length!==1)return say(matches.length?`open: '${arg}' matches ${matches.map(slug).join(', ')}. Be more specific.`:`open: no project matches '${arg}'. Try ls projects`);
        return {...say({text:`Opening ${slug(matches[0])}…`,href:matches[0].url}),open:matches[0].url};
      }
      case 'contact':return say({text:data.email,href:'mailto:'+data.email},{text:data.github,href:data.github});
      case 'cv':return say({text:'Mateo’s CV (PDF)',href:data.cv});
      case 'date':return say(now.toString());
      case 'clear':return {lines:[],clear:true};
      case 'exit':return {lines:[],exit:true};
      case 'sudo':
        if(arg==='hire mateo')return {...say('[sudo] password for recruiter: ********','Access granted. Mateo has been added to your shortlist.',"Next step: type contact. He's quick to reply."),secret:'hire'};
        return say(args.length?'Nice try. This incident will be reported.':'usage: sudo <command>');
      case 'cheat':case 'konami':return say('Psst. Take a closer look at the rug.');
      default:return say(`command not found: ${cmd.slice(0,40)}. Try help`);
    }
  }
  const api={run,COMMANDS};if(typeof module!=='undefined')module.exports=api;else root.TerminalCore=api;
})(typeof window==='undefined'?globalThis:window);
