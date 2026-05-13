const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTargets() {
  const { data, error } = await supabase
    .from('targets')
    .select('id, name, contact_name')
    .or('instagram_url.is.null,facebook_url.is.null,tiktok_url.is.null')
    .limit(5); // Let's start with 5

  if (error) {
    console.error(error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

getTargets();
