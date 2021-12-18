# name: discourse-nft-avatar
# about: Set a verified NFT avatar
# version: 0.0.1
# authors: Mostafa Elshamy
# url: https://github.com/melhosseiny/discourse-nft-avatar

enabled_site_setting :nft_avatar_enabled

register_asset 'stylesheets/common.scss'
register_asset 'stylesheets/desktop.scss', :desktop
register_asset 'stylesheets/mobile.scss', :mobile
