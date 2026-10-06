/* Accessible interaction layer. No inquiry information is stored. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const data = window.SITE_DATA || {};
  const money = n => new Intl.NumberFormat('en-PH', {style: 'currency', currency: 'PHP', maximumFractionDigits: 0}).format(n);
  const number = (el, min, max) => {
    const n = Number(el?.value);
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
  };
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const dateAfter = (value, days = 1) => {const d = new Date(value + 'T12:00:00'); d.setDate(d.getDate()+days); return localDate(d);};
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value+'T12:00:00').getTime()) && localDate(new Date(value+'T12:00:00')) === value;

  // Keep the same navigation usable by mouse, keyboard, and touch.
  const nav = $('#site-nav'), toggle = $('.menu-toggle'), close = $('.menu-close');
  if (nav && toggle) {
    const syncTextSize = () => document.body.classList.toggle('compact-navigation', parseFloat(getComputedStyle(document.documentElement).fontSize) > 20);
    syncTextSize();
    if ('ResizeObserver' in window) new ResizeObserver(syncTextSize).observe(document.documentElement);
    const openMenu = () => {nav.classList.add('is-open'); toggle.setAttribute('aria-expanded','true'); document.body.classList.add('menu-open'); close.focus();};
    const closeMenu = (restore = true) => {nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); if(restore) toggle.focus();};
    toggle.addEventListener('click',openMenu); close.addEventListener('click',() => closeMenu());
    nav.addEventListener('keydown',e => {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') {e.preventDefault();closeMenu();}
      if (e.key === 'Tab') {
        const items = $$('button, a[href]',nav).filter(x => x.getClientRects().length);
        const first = items[0], last = items[items.length-1];
        if(e.shiftKey && document.activeElement === first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement === last){e.preventDefault();first.focus();}
      }
    });
    matchMedia('(min-width:1024px)').addEventListener('change', e => {if(e.matches) closeMenu(false);});
  }

  // Motion is progressive enhancement; content remains visible without JS.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }), {threshold: .06});
    $$('.reveal').forEach(el => observer.observe(el));
  }

  // Day tabs with roving focus and arrow-key navigation.
  $$('.itinerary-tabs').forEach(list => {
    const tabs = $$('[role=tab]', list);
    const activate = tab => {
      tabs.forEach(t => {const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!selected;});
    };
    tabs.forEach((tab,i) => {
      tab.addEventListener('click',() => activate(tab));
      tab.addEventListener('keydown',e => {
        let next=i;
        if(e.key==='ArrowRight')next=(i+1)%tabs.length;
        else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
        else if(e.key==='Home')next=0;
        else if(e.key==='End')next=tabs.length-1;
        else return;
        e.preventDefault();activate(tabs[next]);tabs[next].focus();
      });
    });
  });

  // Gallery filtering and native modal lightbox, scoped to visible photographs.
  const gallery = $('.gallery-grid'), lightbox = $('#lightbox');
  if(gallery && lightbox){
    const figures=$$('.gallery-item',gallery);let current=0, visible=figures, opener=null;
    const show = index => {
      current=(index+visible.length)%visible.length;
      const button=$('button',visible[current]);
      $('#lightbox-image').src=button.dataset.src;$('#lightbox-image').alt=button.dataset.alt;
      $('#lightbox-caption').textContent=button.dataset.caption;
      $('#lightbox-credit').textContent=`Photo: ${button.dataset.photographer} · Pexels. Illustrative stock photography.`;
      $('#lightbox-count').textContent=`${current+1} / ${visible.length}`;
    };
    $$('.filter').forEach(button => button.addEventListener('click',() => {
      $$('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      figures.forEach(f=>f.hidden=button.dataset.filter!=='all'&&f.dataset.category!==button.dataset.filter);
      visible=figures.filter(f=>!f.hidden);$('#gallery-count').textContent=`${visible.length} photographs`;
    }));
    figures.forEach(figure => $('button',figure).addEventListener('click',e => {
      opener=e.currentTarget;visible=figures.filter(f=>!f.hidden);show(visible.indexOf(figure));lightbox.showModal();
    }));
    $('#lightbox-close').addEventListener('click',()=>lightbox.close());
    $('#lightbox-prev').addEventListener('click',()=>show(current-1));
    $('#lightbox-next').addEventListener('click',()=>show(current+1));
    lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}});
    lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close();}});
    lightbox.addEventListener('close',()=>opener?.focus());
  }

  // Date/party quick entry forwards only validated planning values.
  const availability=$('#availability-form');
  if(availability){
    const arrival=$('[name=checkin]',availability),departure=$('[name=checkout]',availability);
    arrival.min=localDate();departure.min=dateAfter(localDate());
    arrival.addEventListener('change',()=>{if(validDate(arrival.value)){departure.min=dateAfter(arrival.value);if(departure.value&&departure.value<=arrival.value)departure.value=dateAfter(arrival.value);}});
    availability.addEventListener('submit',e=>{
      e.preventDefault();const adults=number($('[name=adults]',availability),1,30);
      if(!validDate(arrival.value)||arrival.value<localDate()||!validDate(departure.value)||departure.value<=arrival.value||adults===null){$('#availability-error').hidden=false;return;}
      location.href='booking.html?'+new URLSearchParams({checkin:arrival.value,checkout:departure.value,adults});
    });
  }

  const roomFinder=$('#room-finder');
  if(roomFinder){
    const update=()=>{
      const party=number($('#room-guests'),1,4),type=$('#traveler-type').value;
      if(party===null)return;
      let room='standard-room',pack='business-stay',name='Standard Room',reason='A useful desk and a calm place to rest after a working day.';
      if(party>=3||type==='family'){room='family-suite';pack='family-city-weekend';name='Family Suite';reason='Two beds and a shared lounge give your group a comfortable place to settle in.';}
      else if(type==='couple'){room='deluxe-room';pack='romantic-staycation';name='Deluxe Room';reason='A sitting corner and breakfast for two suit an unhurried city break.';}
      $('#room-result-name').textContent=name;$('#room-result-reason').textContent=reason;
      $('#room-result-link').href=`booking.html?item=${room}&adults=${party}`;
      const p=data.packages.find(p=>p.id===pack);$('#room-package-link').href=`packages.html#${pack}`;$('#room-package-link').textContent=`Matching package: ${p.name}`;
      $$('[data-offering]').forEach(card=>{card.classList.toggle('recommended',card.dataset.offering===room);});
    };
    roomFinder.addEventListener('change',update);update();
  }

  const calculator=$('#group-calculator');
  if(calculator){
    const packageInput=$('#calc-package'),adultsInput=$('#calc-adults'),kidsInput=$('#calc-children'),nightsInput=$('#calc-nights');
    const update=()=>{
      const p=data.packages.find(p=>p.id===packageInput.value),adults=number(adultsInput,1,30),kids=number(kidsInput,0,20),nights=number(nightsInput,1,14);
      const min=p.id==='barkada-weekend'?10:2;const cap=p.id==='barkada-weekend'?15:p.id==='family-fun'?5:2;
      let error='';
      if(adults===null||kids===null||nights===null)error='Use whole numbers: 1–30 adults, 0–20 children, and 1–14 nights.';
      else if(adults<min)error=`This package needs at least ${min} adults for its published sample rate.`;
      else if(adults+kids>cap)error=`This sample accommodation holds up to ${cap} guests. Ask about multiple units for a larger group.`;
      $('#calc-error').textContent=error;$('#calc-result-link').hidden=!!error;
      if(error){$('#calc-total').textContent='Adjust your group';$('#calc-per-head').textContent='';$('#calc-breakdown').textContent='';return;}
      const total=(adults*p.adult_rate+kids*p.child_rate)*nights;
      $('#calc-total').textContent=money(total);$('#calc-per-head').textContent=`${money(Math.round(total/(adults+kids)))} per guest for the selected stay`;
      $('#calc-breakdown').textContent=`(${adults} adults × ${money(p.adult_rate)} + ${kids} children × ${money(p.child_rate)}) × ${nights} night${nights>1?'s':''}.`;
      $('#calc-duration-note').textContent=nights===p.days-1?'Estimate uses the package’s published duration.':'Adjusted stay pricing is an estimate. The itinerary shown on Packages retains its published duration; request adjusted inclusions, itinerary, and a final quote.';
      $('#calc-result-link').href='booking.html?'+new URLSearchParams({item:p.id,adults,children:kids,nights,estimate:String(total)});
    };
    packageInput.addEventListener('change',()=>{const p=data.packages.find(p=>p.id===packageInput.value);nightsInput.value=p.days-1;adultsInput.value=p.id==='barkada-weekend'?10:2;kidsInput.value=0;update();});
    calculator.addEventListener('input',update);update();
  }

  const trip=$('#trip-planner');
  if(trip){
    const update=()=>{
      const size=number($('#trip-size'),1,8),pace=$('#trip-pace').value;if(size===null)return;
      let id=pace==='adventurous'?'adventure-camp':'highland-escape';
      if(size>4)id='team-retreat';else if(size>2)id='adventure-camp';
      const p=data.packages.find(p=>p.id===id);
      $('#trip-name').textContent=p.name;
      $('#trip-activities').textContent=pace==='relaxed'?'Ask for garden walks and cabin time in place of strenuous trails.':pace==='moderate'?'Choose a sunrise walk with your guide, then leave the afternoon free.':'Discuss the longer guided route and suitable trail gear before traveling.';
      $('#trip-group-note').textContent=`Recommended for ${size} guest${size>1?'s':''}. Published package inclusions and group price apply; a different pace requires a tailored inquiry.`;
      $('#trip-result-link').href='booking.html?'+new URLSearchParams({item:id,adults:size,pace});
      $('#trip-package-link').href=`packages.html#${id}`;
    };
    trip.addEventListener('change',update);update();
  }

  // Honest static-demo form mode, or real service delivery after configuration.
  const query=new URLSearchParams(location.search);
  $$('.inquiry-form').forEach(form=>{
    const booking=form.dataset.kind==='booking',arrival=$('[name=checkin]',form),departure=$('[name=checkout]',form);
    if(booking){
      const item=$('[name=item]',form);if([...item.options].some(o=>o.value===query.get('item')))item.value=query.get('item');
      ['adults','children'].forEach(name=>{const q=Number(query.get(name));if(query.has(name)&&Number.isInteger(q)&&q>=(name==='adults'?1:0)&&q<=(name==='adults'?30:20))$(`[name=${name}]`,form).value=q;});
      if(validDate(query.get('checkin')||'')&&query.get('checkin')>=localDate())arrival.value=query.get('checkin');
      if(validDate(query.get('checkout')||'')&&query.get('checkout')>arrival.value)departure.value=query.get('checkout');
      arrival.min=localDate();
      const dates=(fill=false)=>{
        const option=[...item.options].find(o=>o.selected),overnight=option?.dataset.overnight==='true';
        departure.required=overnight;$('#checkout-label').textContent=overnight?'Check-out date *':'End date (optional for a day visit)';
        if(validDate(arrival.value)){
          departure.min=dateAfter(arrival.value);
          if(fill&&overnight){
            const nights=Number(query.get('nights')),pack=data.packages.find(p=>p.id===item.value);
            const duration=Number.isInteger(nights)&&nights>=1&&nights<=14?nights:pack?pack.days-1:1;
            departure.value=dateAfter(arrival.value,duration);
          }else if(departure.value&&departure.value<=arrival.value)departure.value=overnight?dateAfter(arrival.value):'';
        }
      };
      arrival.addEventListener('change',()=>dates(true));item.addEventListener('change',()=>{if(item.selectedOptions[0].dataset.overnight!=='true')departure.value='';dates(true);});dates();
      const notes=[];
      if(query.has('estimate')){const est=Number(query.get('estimate'));if(Number.isFinite(est)&&est>0&&est<10000000)notes.push(`Planning estimate: ${money(est)} for ${query.get('nights')||1} night(s). Final rate and capacity need confirmation.`);}
      if(['relaxed','moderate','adventurous'].includes(query.get('pace')))notes.push(`Preferred activity pace: ${query.get('pace')}. Please suggest a suitable itinerary.`);
      if(notes.length)$('[name=message]',form).value=notes.join('\n');
    }
    const cfg=window.FORM_CONFIG||{},endpoint=cfg.endpoint||'',realEndpoint=/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
    const submit=$('[type=submit]',form);submit.textContent=realEndpoint?'Send inquiry':'Prepare inquiry';
    const error=(el,message)=>{el.setAttribute('aria-invalid',message?'true':'false');const block=$('#'+el.id+'-error');if(block)block.textContent=message;return !message;};
    $$('input,select,textarea',form).forEach(el=>el.addEventListener('input',()=>error(el,'')));
    form.addEventListener('submit',async e=>{
      e.preventDefault();const errors=[];
      const check=(el,msg)=>{if(!error(el,msg))errors.push(el);};
      $$('input:not([type=hidden]),select,textarea',form).filter(el=>!el.classList.contains('honeypot')).forEach(el=>{
        let message='';const value=el.value.trim();
        if(el.required&&(el.type==='checkbox'?!el.checked:!value))message=el.type==='checkbox'?'Please agree before preparing your inquiry.':'Please complete this field.';
        else if(el.type==='email'&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))message='Enter a valid email address.';
        else if(el.type==='number'&&number(el,Number(el.min),Number(el.max))===null)message=`Enter a whole number from ${el.min} to ${el.max}.`;
        else if(el.type==='date'&&value&&(!validDate(value)||value<el.min))message='Choose a valid date within the displayed range.';
        else if(el.name==='name'&&value.length<2)message='Enter your full name.';
        else if(el.maxLength>0&&value.length>el.maxLength)message=`Keep this field under ${el.maxLength} characters.`;
        check(el,message);
      });
      if(booking&&arrival.value&&departure.value&&departure.value<=arrival.value)check(departure,'Check-out must be after check-in.');
      const summary=$('.error-summary',form);summary.textContent=errors.length?'Please review the highlighted fields.':'';
      if(errors.length){errors[0].focus();return;}
      if($('[name=website]',form).value)return;
      const fields=new FormData(form);fields.delete('website');fields.delete('consent');
      const values=Object.fromEntries(fields.entries());if(booking)values.item=$('[name=item]',form).selectedOptions[0].textContent;
      const text=[`${data.name} — ${booking?'Stay inquiry':'Contact inquiry'}`, ...Object.entries(values).filter(([,v])=>v).map(([k,v])=>`${({name:'Name',email:'Email',mobile:'Mobile',item:'Requested offering',checkin:'Check-in / visit',checkout:'Check-out',adults:'Adults',children:'Children',subject:'Subject',message:'Message'})[k]||k}: ${v}`)].join('\n');
      const status=$('.form-status',form);status.hidden=false;
      if(!realEndpoint){
        $('h3',status).textContent='Your inquiry draft is ready.';
        $('.status-copy',status).textContent='Nothing has been sent or stored. Contact details are illustrative; use this draft for the academic demonstration.';
        $('pre',status).textContent=text;$('.draft-actions',status).hidden=false;
        $('.copy-draft',status).onclick=async()=>{try{await navigator.clipboard.writeText(text);$('.copy-draft',status).textContent='Draft copied';}catch{const a=document.createElement('textarea');a.value=text;status.append(a);a.select();document.execCommand('copy');a.remove();$('.copy-draft',status).textContent='Draft copied';}};
        $('.download-draft',status).onclick=()=>{const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${data.key}-inquiry.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
      }else{
        submit.disabled=true;$('h3',status).textContent='Sending your inquiry…';$('.status-copy',status).textContent='';$('pre',status).textContent='';$('.draft-actions',status).hidden=true;
        try{const response=await fetch(endpoint,{method:'POST',body:fields,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Delivery failed');$('h3',status).textContent='Your inquiry has been sent.';$('.status-copy',status).textContent='Please wait for a reply confirming availability and final terms. This is not a reservation or payment confirmation.';form.reset();}
        catch{$('h3',status).textContent='Your inquiry could not be sent.';$('.status-copy',status).textContent='Please try again later. No delivery has been confirmed.';}
        finally{submit.disabled=false;}
      }
      status.tabIndex=-1;status.focus();
    });
  });
})();
