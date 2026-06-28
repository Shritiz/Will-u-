document.addEventListener('DOMContentLoaded',()=>{
  const btn=document.getElementById('actionBtn');
  const cards=document.getElementById('cards');
  btn.addEventListener('click',()=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`<strong>Card</strong><p>Created at ${new Date().toLocaleTimeString()}</p>`;
    cards.prepend(card);
    setTimeout(()=>card.classList.add('flash'),100);
  });
});
